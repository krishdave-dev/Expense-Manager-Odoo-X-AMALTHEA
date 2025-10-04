import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SignupDto } from './dto/signup.dto';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private httpService: HttpService,
  ) {}

  /**
   * Company signup - creates company and admin user
   */
  async signup(signupDto: SignupDto) {
    const { email, password, name, country } = signupDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      // Fetch currency from REST Countries API
      const response = await firstValueFrom(
        this.httpService.get(
          `https://restcountries.com/v3.1/name/${country}?fields=currencies`,
        ),
      );

      if (!response.data || response.data.length === 0) {
        throw new BadRequestException('Country not found');
      }

      const countryData = response.data[0];
      const currencies = countryData.currencies;
      
      if (!currencies || Object.keys(currencies).length === 0) {
        throw new BadRequestException('No currency found for this country');
      }

      const currencyCode = Object.keys(currencies)[0];
      const currencySymbol = currencies[currencyCode]?.symbol || currencyCode;

      // Create company and admin user in a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create company
        const company = await tx.company.create({
          data: {
            name: `${name}'s Company`,
            country,
            currency_code: currencyCode,
            currency_symbol: currencySymbol,
          },
        });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create admin user
        const user = await tx.user.create({
          data: {
            email,
            name,
            password_hash: hashedPassword,
            role: 'ADMIN',
            company_id: company.id,
            is_temp_password: false,
            is_active: true, // Admin users are always active
          },
        });

        return { company, user };
      });

      return {
        message: 'Company and Admin created successfully',
        companyId: result.company.id,
        userId: result.user.id,
        company: {
          name: result.company.name,
          country: result.company.country,
          currency: {
            code: result.company.currency_code,
            symbol: result.company.currency_symbol,
          },
        },
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new BadRequestException('Country not found');
      }
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create company. Please try again.');
    }
  }

  /**
   * User login
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with company details
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password first
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // If user is inactive but has valid credentials, activate them on first login
    if (!user.is_active) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { is_active: true },
      });
      user.is_active = true; // Update local object for response
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.company_id,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.company_id,
        isTempPassword: user.is_temp_password,
      },
      company: {
        id: user.company.id,
        name: user.company.name,
        country: user.company.country,
        currency: {
          code: user.company.currency_code,
          symbol: user.company.currency_symbol,
        },
      },
    };
  }

  /**
   * Change password
   */
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password and remove temp password flag
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: hashedNewPassword,
        is_temp_password: false,
        updated_at: new Date(),
      },
    });

    return {
      message: 'Password changed successfully',
    };
  }
}