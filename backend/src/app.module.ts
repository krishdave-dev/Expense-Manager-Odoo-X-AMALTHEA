// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { ExchangeRatesModule } from './exchange-rates/exchange-rates.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    AuthModule,
    ExpensesModule,
    ApprovalsModule,
    ExchangeRatesModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}