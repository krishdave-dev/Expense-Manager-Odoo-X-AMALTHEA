import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
export declare class AuthService {
    private prisma;
    private httpService;
    constructor(prisma: PrismaService, httpService: HttpService);
    signup(signupDto: SignupDto): Promise<{
        message: string;
        companyId: number;
        userId: number;
    }>;
}
