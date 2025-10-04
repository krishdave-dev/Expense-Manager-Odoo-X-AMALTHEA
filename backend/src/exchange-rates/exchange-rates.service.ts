// src/exchange-rates/exchange-rates.service.ts
import { Injectable, HttpServer, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

export interface Currency {
  code: string;
  name: string;
  symbol?: string;
}

interface CountryData {
  name: {
    common: string;
  };
  currencies: {
    [key: string]: {
      name: string;
      symbol?: string;
    };
  };
}

@Injectable()
export class ExchangeRatesService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async convertAmount(amount: number, from: string, to: string): Promise<number> {
    if (from === to) return amount;

    const rateRecord = await this.prisma.exchangeRate.findUnique({
      where: { base_currency_target_currency: { base_currency: from, target_currency: to } },
    });

    let rateValue: number;
    if (!rateRecord || Date.now() - new Date(rateRecord.fetched_at).getTime() > 3600000) {
      const res = await firstValueFrom(
        this.httpService.get(`https://api.exchangerate-api.com/v4/latest/${from}`),
      );
      rateValue = res.data.rates[to];
      if (!rateValue) throw new Error('Currency not supported');

      await this.prisma.exchangeRate.upsert({
        where: { base_currency_target_currency: { base_currency: from, target_currency: to } },
        update: { rate: rateValue, fetched_at: new Date() },
        create: { base_currency: from, target_currency: to, rate: rateValue },
      });
    } else {
      rateValue = parseFloat(rateRecord.rate.toString());
    }

    return parseFloat((amount * rateValue).toFixed(2));
  }

  /**
   * Get all supported currencies from countries API
   */
  async getSupportedCurrencies(): Promise<Currency[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          'https://restcountries.com/v3.1/all?fields=name,currencies',
        ),
      );

      const countries: CountryData[] = response.data;
      const currencyMap = new Map<string, Currency>();

      countries.forEach((country) => {
        if (country.currencies) {
          Object.entries(country.currencies).forEach(([code, details]) => {
            if (!currencyMap.has(code)) {
              currencyMap.set(code, {
                code,
                name: details.name,
                symbol: details.symbol,
              });
            }
          });
        }
      });

      // Convert to array and sort by currency code
      return Array.from(currencyMap.values()).sort((a, b) => a.code.localeCompare(b.code));
    } catch (error) {
      throw new BadRequestException('Failed to fetch supported currencies');
    }
  }

  /**
   * Get current exchange rates for a base currency
   */
  async getExchangeRates(baseCurrency: string): Promise<{ [key: string]: number }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`),
      );

      return response.data.rates;
    } catch (error) {
      throw new BadRequestException(`Failed to fetch exchange rates for ${baseCurrency}`);
    }
  }

  /**
   * Convert amount with caching and validation
   */
  async convertAmountWithValidation(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<{
    originalAmount: number;
    convertedAmount: number;
    exchangeRate: number;
    fromCurrency: string;
    toCurrency: string;
  }> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    if (!fromCurrency || !toCurrency) {
      throw new BadRequestException('Both from and to currencies are required');
    }

    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        convertedAmount: amount,
        exchangeRate: 1,
        fromCurrency,
        toCurrency,
      };
    }

    // Check if we have a cached rate
    const rateRecord = await this.prisma.exchangeRate.findUnique({
      where: { 
        base_currency_target_currency: { 
          base_currency: fromCurrency, 
          target_currency: toCurrency 
        } 
      },
    });

    let exchangeRate: number;
    const oneHourAgo = new Date(Date.now() - 3600000); // 1 hour cache

    if (!rateRecord || rateRecord.fetched_at < oneHourAgo) {
      // Fetch fresh rates
      try {
        const response = await firstValueFrom(
          this.httpService.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`),
        );

        exchangeRate = response.data.rates[toCurrency];
        if (!exchangeRate) {
          throw new BadRequestException(`Conversion rate not available for ${fromCurrency} to ${toCurrency}`);
        }

        // Update or create rate record
        await this.prisma.exchangeRate.upsert({
          where: { 
            base_currency_target_currency: { 
              base_currency: fromCurrency, 
              target_currency: toCurrency 
            } 
          },
          update: { 
            rate: exchangeRate, 
            fetched_at: new Date() 
          },
          create: { 
            base_currency: fromCurrency, 
            target_currency: toCurrency, 
            rate: exchangeRate,
            fetched_at: new Date(),
          },
        });
      } catch (error) {
        throw new BadRequestException(`Failed to fetch exchange rate for ${fromCurrency} to ${toCurrency}`);
      }
    } else {
      exchangeRate = parseFloat(rateRecord.rate.toString());
    }

    const convertedAmount = parseFloat((amount * exchangeRate).toFixed(2));

    return {
      originalAmount: amount,
      convertedAmount,
      exchangeRate,
      fromCurrency,
      toCurrency,
    };
  }
}