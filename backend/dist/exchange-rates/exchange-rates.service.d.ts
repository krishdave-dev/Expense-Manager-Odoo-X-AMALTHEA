import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
export declare class ExchangeRatesService {
    private prisma;
    private httpService;
    constructor(prisma: PrismaService, httpService: HttpService);
    convertAmount(amount: number, from: string, to: string): Promise<number>;
}
