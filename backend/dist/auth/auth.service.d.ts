import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SignupDto } from './dto/signup.dto';
import { MailService } from '../mail/mail.service';
import { HttpService } from '@nestjs/axios';
export declare class AuthService {
    private prisma;
    private jwtService;
    private mailService;
    private httpService;
    constructor(prisma: PrismaService, jwtService: JwtService, mailService: MailService, httpService: HttpService);
    signup(signupDto: SignupDto): Promise<{
        message: string;
        companyId: number;
        userId: number;
        company: {
            name: string;
            country: string;
            currency: {
                code: string;
                symbol: string;
            };
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            companyId: number;
            isTempPassword: boolean;
        };
        company: {
            id: number;
            name: string;
            country: string;
            currency: {
                code: string;
                symbol: string;
            };
        };
    }>;
    changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
