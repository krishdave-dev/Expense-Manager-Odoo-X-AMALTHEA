import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
export interface Currency {
    code: string;
    name: string;
    symbol?: string;
}
export declare class ExchangeRatesService {
    private prisma;
    private httpService;
    constructor(prisma: PrismaService, httpService: HttpService);
    convertAmount(amount: number, from: string, to: string): Promise<number>;
    getSupportedCurrencies(): Promise<Currency[]>;
    getExchangeRates(baseCurrency: string): Promise<{
        [key: string]: number;
    }>;
    convertAmountWithValidation(amount: number, fromCurrency: string, toCurrency: string): Promise<{
        originalAmount: number;
        convertedAmount: number;
        exchangeRate: number;
        fromCurrency: string;
        toCurrency: string;
    }>;
}
