// src/exchange-rates/exchange-rates.service.ts
import { Injectable, HttpServer } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

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
}