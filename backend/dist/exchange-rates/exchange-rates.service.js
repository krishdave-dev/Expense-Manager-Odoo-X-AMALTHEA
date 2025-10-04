"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeRatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const rxjs_1 = require("rxjs");
const axios_1 = require("@nestjs/axios");
let ExchangeRatesService = class ExchangeRatesService {
    constructor(prisma, httpService) {
        this.prisma = prisma;
        this.httpService = httpService;
    }
    async convertAmount(amount, from, to) {
        if (from === to)
            return amount;
        const rateRecord = await this.prisma.exchangeRate.findUnique({
            where: { base_currency_target_currency: { base_currency: from, target_currency: to } },
        });
        let rateValue;
        if (!rateRecord || Date.now() - new Date(rateRecord.fetched_at).getTime() > 3600000) {
            const res = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`https://api.exchangerate-api.com/v4/latest/${from}`));
            rateValue = res.data.rates[to];
            if (!rateValue)
                throw new Error('Currency not supported');
            await this.prisma.exchangeRate.upsert({
                where: { base_currency_target_currency: { base_currency: from, target_currency: to } },
                update: { rate: rateValue, fetched_at: new Date() },
                create: { base_currency: from, target_currency: to, rate: rateValue },
            });
        }
        else {
            rateValue = parseFloat(rateRecord.rate.toString());
        }
        return parseFloat((amount * rateValue).toFixed(2));
    }
    async getSupportedCurrencies() {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get('https://restcountries.com/v3.1/all?fields=name,currencies'));
            const countries = response.data;
            const currencyMap = new Map();
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
            return Array.from(currencyMap.values()).sort((a, b) => a.code.localeCompare(b.code));
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch supported currencies');
        }
    }
    async getExchangeRates(baseCurrency) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`));
            return response.data.rates;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to fetch exchange rates for ${baseCurrency}`);
        }
    }
    async convertAmountWithValidation(amount, fromCurrency, toCurrency) {
        if (amount <= 0) {
            throw new common_1.BadRequestException('Amount must be greater than 0');
        }
        if (!fromCurrency || !toCurrency) {
            throw new common_1.BadRequestException('Both from and to currencies are required');
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
        const rateRecord = await this.prisma.exchangeRate.findUnique({
            where: {
                base_currency_target_currency: {
                    base_currency: fromCurrency,
                    target_currency: toCurrency
                }
            },
        });
        let exchangeRate;
        const oneHourAgo = new Date(Date.now() - 3600000);
        if (!rateRecord || rateRecord.fetched_at < oneHourAgo) {
            try {
                const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`));
                exchangeRate = response.data.rates[toCurrency];
                if (!exchangeRate) {
                    throw new common_1.BadRequestException(`Conversion rate not available for ${fromCurrency} to ${toCurrency}`);
                }
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
            }
            catch (error) {
                throw new common_1.BadRequestException(`Failed to fetch exchange rate for ${fromCurrency} to ${toCurrency}`);
            }
        }
        else {
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
};
exports.ExchangeRatesService = ExchangeRatesService;
exports.ExchangeRatesService = ExchangeRatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        axios_1.HttpService])
], ExchangeRatesService);
//# sourceMappingURL=exchange-rates.service.js.map