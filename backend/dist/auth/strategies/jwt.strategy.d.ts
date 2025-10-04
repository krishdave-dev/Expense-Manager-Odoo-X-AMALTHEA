import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
export interface JwtPayload {
    sub: number;
    email: string;
    role: string;
    companyId: number;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        id: number;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        companyId: number;
        company: {
            id: number;
            name: string;
            created_at: Date;
            updated_at: Date;
            country: string | null;
            currency_code: string;
            currency_symbol: string | null;
        };
        isTempPassword: boolean;
    }>;
}
export {};
