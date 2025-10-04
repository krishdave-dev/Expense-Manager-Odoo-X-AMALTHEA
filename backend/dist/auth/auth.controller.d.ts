import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SignupDto } from './dto/signup.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthController {
    private authService;
    private prisma;
    constructor(authService: AuthService, prisma: PrismaService);
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
    changePassword(user: any, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    debugUsers(): Promise<{
        message: string;
        users: {
            password_hash: string;
            company: {
                name: string;
                id: number;
            };
            name: string;
            created_at: Date;
            id: number;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            is_active: boolean;
            is_temp_password: boolean;
        }[];
        total: number;
    }>;
}
