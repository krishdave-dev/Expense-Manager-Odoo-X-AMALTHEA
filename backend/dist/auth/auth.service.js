"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
const bcrypt = __importStar(require("bcrypt"));
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let AuthService = class AuthService {
    constructor(prisma, jwtService, mailService, httpService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.mailService = mailService;
        this.httpService = httpService;
    }
    async signup(signupDto) {
        const { email, password, name, country } = signupDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`https://restcountries.com/v3.1/name/${country}?fields=currencies`));
            if (!response.data || response.data.length === 0) {
                throw new common_1.BadRequestException('Country not found');
            }
            const countryData = response.data[0];
            const currencies = countryData.currencies;
            if (!currencies || Object.keys(currencies).length === 0) {
                throw new common_1.BadRequestException('No currency found for this country');
            }
            const currencyCode = Object.keys(currencies)[0];
            const currencySymbol = currencies[currencyCode]?.symbol || currencyCode;
            const result = await this.prisma.$transaction(async (tx) => {
                const company = await tx.company.create({
                    data: {
                        name: `${name}'s Company`,
                        country,
                        currency_code: currencyCode,
                        currency_symbol: currencySymbol,
                    },
                });
                const hashedPassword = await bcrypt.hash(password, 12);
                const user = await tx.user.create({
                    data: {
                        email,
                        name,
                        password_hash: hashedPassword,
                        role: 'ADMIN',
                        company_id: company.id,
                        is_temp_password: false,
                        is_active: true,
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
        }
        catch (error) {
            if (error.response?.status === 404) {
                throw new common_1.BadRequestException('Country not found');
            }
            if (error instanceof common_1.ConflictException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to create company. Please try again.');
        }
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { company: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (!user.is_active) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { is_active: true },
            });
            user.is_active = true;
        }
        const payload = {
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
    async changePassword(userId, changePasswordDto) {
        const { currentPassword, newPassword } = changePasswordDto;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        mail_service_1.MailService,
        axios_1.HttpService])
], AuthService);
//# sourceMappingURL=auth.service.js.map