// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, password, name, country } = signupDto;

    // Fetch currency from REST Countries API
    const countries = await firstValueFrom(
      this.httpService.get(
        `https://restcountries.com/v3.1/name/${country}?fields=currencies`,
      ),
    );
    const countryData = (countries as any).data[0];
    const currencyCode = Object.keys(countryData.currencies)[0];
    const currencySymbol = countryData.currencies[currencyCode]?.symbol || currencyCode;

    // Create company
    const company = await this.prisma.company.create({
      data: {
        name: `${name}'s Company`,
        country,
        currency_code: currencyCode,
        currency_symbol: currencySymbol,
      },
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password_hash: hashedPassword,
        role: 'ADMIN',
        company: { connect: { id: company.id } },
      },
    });

    // Create default approval flow (admin approves all expenses)
    await this.prisma.approvalFlow.create({
      data: {
        company_id: company.id,
        step_order: 1,
        approver_role: 'ADMIN',
        specific_user_id: user.id,
        is_manager_approver: false,
      },
    });

    return {
      message: 'Company and Admin created successfully',
      companyId: company.id,
      userId: user.id,
    };
  }
}