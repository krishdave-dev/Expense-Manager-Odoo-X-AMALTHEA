import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private exchangeRatesService: ExchangeRatesService) {}

  /**
   * Get all supported currencies
   */
  @Get('currencies')
  async getSupportedCurrencies() {
    return this.exchangeRatesService.getSupportedCurrencies();
  }

  /**
   * Get exchange rates for a base currency
   */
  @Get('rates')
  async getExchangeRates(@Query('base') baseCurrency: string) {
    return this.exchangeRatesService.getExchangeRates(baseCurrency);
  }

  /**
   * Convert amount between currencies
   */
  @Get('convert')
  async convertAmount(
    @Query('amount') amount: string,
    @Query('from') fromCurrency: string,
    @Query('to') toCurrency: string,
  ) {
    const numericAmount = parseFloat(amount);
    return this.exchangeRatesService.convertAmountWithValidation(
      numericAmount,
      fromCurrency,
      toCurrency,
    );
  }
}