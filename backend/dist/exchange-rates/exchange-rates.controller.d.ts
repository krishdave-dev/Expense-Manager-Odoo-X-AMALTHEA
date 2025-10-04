import { ExchangeRatesService } from './exchange-rates.service';
export declare class ExchangeRatesController {
    private exchangeRatesService;
    constructor(exchangeRatesService: ExchangeRatesService);
    getSupportedCurrencies(): Promise<import("./exchange-rates.service").Currency[]>;
    getExchangeRates(baseCurrency: string): Promise<{
        [key: string]: number;
    }>;
    convertAmount(amount: string, fromCurrency: string, toCurrency: string): Promise<{
        originalAmount: number;
        convertedAmount: number;
        exchangeRate: number;
        fromCurrency: string;
        toCurrency: string;
    }>;
}
