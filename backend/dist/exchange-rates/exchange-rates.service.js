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
};
exports.ExchangeRatesService = ExchangeRatesService;
exports.ExchangeRatesService = ExchangeRatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        axios_1.HttpService])
], ExchangeRatesService);
//# sourceMappingURL=exchange-rates.service.js.map