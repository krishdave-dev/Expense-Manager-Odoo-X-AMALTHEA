// src/exchange-rates/exchange-rates.module.ts
import { Module } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import { ExchangeRatesController } from './exchange-rates.controller';
import { PrismaService } from '../prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ExchangeRatesController],
  providers: [ExchangeRatesService, PrismaService],
  exports: [ExchangeRatesService], // so other modules can use it
})
export class ExchangeRatesModule {}