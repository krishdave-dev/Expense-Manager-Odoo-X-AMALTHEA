// src/approvals/approvals.module.ts
import { Module } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { ApprovalsController } from './approvals.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ApprovalsController],
  providers: [ApprovalsService, PrismaService],
})
export class ApprovalsModule {}