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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
    }
    async createUser(adminUserId, createUserDto) {
        const { name, email, role } = createUserDto;
        const adminUser = await this.prisma.user.findUnique({
            where: { id: adminUserId },
            include: { company: true },
        });
        if (!adminUser || adminUser.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only admins can create users');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const tempPassword = this.generateRandomPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 12);
        try {
            const newUser = await this.prisma.user.create({
                data: {
                    name,
                    email,
                    password_hash: hashedPassword,
                    role,
                    company_id: adminUser.company_id,
                    is_temp_password: true,
                    is_active: false,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    is_active: true,
                    is_temp_password: true,
                    created_at: true,
                },
            });
            try {
                await this.mailService.sendTemporaryPassword(email, name, tempPassword, adminUser.company.name);
                return {
                    message: 'User created successfully and email sent',
                    user: {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        role: newUser.role,
                        companyId: adminUser.company_id,
                        isActive: newUser.is_active,
                        isTempPassword: newUser.is_temp_password,
                        createdAt: newUser.created_at.toISOString(),
                    },
                    tempPassword: undefined,
                };
            }
            catch (emailError) {
                return {
                    message: 'User created successfully but email delivery failed. Please share these credentials manually.',
                    user: {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        role: newUser.role,
                        companyId: adminUser.company_id,
                        isActive: newUser.is_active,
                        isTempPassword: newUser.is_temp_password,
                        createdAt: newUser.created_at.toISOString(),
                    },
                    tempPassword: tempPassword,
                    emailError: 'Email configuration issue - check server logs for details',
                };
            }
        }
        catch (error) {
            throw new Error('Failed to create user');
        }
    }
    async getAllUsers(adminUserId) {
        const adminUser = await this.prisma.user.findUnique({
            where: { id: adminUserId },
        });
        if (!adminUser || adminUser.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only admins can view all users');
        }
        const usersData = await this.prisma.user.findMany({
            where: { company_id: adminUser.company_id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                is_active: true,
                is_temp_password: true,
                created_at: true,
                updated_at: true,
                company_id: true,
                managers: {
                    select: {
                        manager: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            },
                        },
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
        const users = usersData.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyId: user.company_id,
            isActive: user.is_active,
            isTempPassword: user.is_temp_password,
            createdAt: user.created_at.toISOString(),
            updatedAt: user.updated_at?.toISOString(),
            managers: user.managers.map(relation => relation.manager),
        }));
        return {
            users,
            total: users.length,
        };
    }
    async getUserProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                is_active: true,
                is_temp_password: true,
                created_at: true,
                updated_at: true,
                company: {
                    select: {
                        id: true,
                        name: true,
                        country: true,
                        currency_code: true,
                        currency_symbol: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async getCompanyInfo(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        country: true,
                        currency_code: true,
                        currency_symbol: true,
                    },
                },
            },
        });
        if (!user || !user.company) {
            throw new common_1.NotFoundException('User or company not found');
        }
        return {
            id: user.company.id,
            name: user.company.name,
            country: user.company.country,
            currency: {
                code: user.company.currency_code,
                symbol: user.company.currency_symbol,
            },
        };
    }
    async updateUserStatus(adminUserId, targetUserId, isActive) {
        const adminUser = await this.prisma.user.findUnique({
            where: { id: adminUserId },
            include: { company: true },
        });
        if (!adminUser || adminUser.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only admins can update user status');
        }
        if (adminUserId === targetUserId && !isActive) {
            throw new common_1.ForbiddenException('You cannot deactivate your own account');
        }
        const targetUser = await this.prisma.user.findFirst({
            where: {
                id: targetUserId,
                company_id: adminUser.company_id,
            },
        });
        if (!targetUser) {
            throw new common_1.NotFoundException('User not found in your company');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: targetUserId },
            data: { is_active: isActive },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                is_active: true,
                is_temp_password: true,
                updated_at: true,
            },
        });
        if (isActive && targetUser.is_temp_password) {
            try {
                const newTempPassword = this.generateRandomPassword();
                const hashedPassword = await bcrypt.hash(newTempPassword, 12);
                await this.prisma.user.update({
                    where: { id: targetUserId },
                    data: { password_hash: hashedPassword },
                });
                await this.mailService.sendTemporaryPassword(targetUser.email, targetUser.name, newTempPassword, adminUser.company.name);
                return {
                    message: 'User activated successfully and temporary password email sent',
                    user: {
                        id: updatedUser.id,
                        name: updatedUser.name,
                        email: updatedUser.email,
                        role: updatedUser.role,
                        companyId: targetUser.company_id,
                        isActive: updatedUser.is_active,
                        isTempPassword: updatedUser.is_temp_password,
                        updatedAt: updatedUser.updated_at?.toISOString(),
                    },
                    emailSent: true,
                };
            }
            catch (emailError) {
                return {
                    message: 'User activated successfully but email delivery failed',
                    user: {
                        id: updatedUser.id,
                        name: updatedUser.name,
                        email: updatedUser.email,
                        role: updatedUser.role,
                        companyId: targetUser.company_id,
                        isActive: updatedUser.is_active,
                        isTempPassword: updatedUser.is_temp_password,
                        updatedAt: updatedUser.updated_at?.toISOString(),
                    },
                    emailSent: false,
                    emailError: 'Please check email configuration',
                };
            }
        }
        return {
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                companyId: targetUser.company_id,
                isActive: updatedUser.is_active,
                isTempPassword: updatedUser.is_temp_password,
                updatedAt: updatedUser.updated_at?.toISOString(),
            },
            emailSent: false,
        };
    }
    async assignManager(adminId, employeeId, managerId) {
        const adminUser = await this.prisma.user.findUnique({
            where: { id: adminId },
            include: { company: true },
        });
        if (!adminUser || adminUser.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only admins can assign managers');
        }
        const employee = await this.prisma.user.findUnique({ where: { id: employeeId } });
        const manager = await this.prisma.user.findUnique({ where: { id: managerId } });
        if (!employee || !manager) {
            throw new common_1.NotFoundException('Employee or manager not found');
        }
        if (employee.company_id !== adminUser.company_id || manager.company_id !== adminUser.company_id) {
            throw new common_1.ForbiddenException('Users must be in the same company');
        }
        if (manager.role !== 'MANAGER' && manager.role !== 'ADMIN') {
            throw new common_1.BadRequestException('Assigned user must have MANAGER or ADMIN role');
        }
        const existing = await this.prisma.managerRelation.findUnique({
            where: {
                employee_id_manager_id: {
                    employee_id: employeeId,
                    manager_id: managerId,
                },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Manager-employee relationship already exists');
        }
        const relation = await this.prisma.managerRelation.create({
            data: {
                employee_id: employeeId,
                manager_id: managerId,
            },
            include: {
                employee: { select: { id: true, name: true, email: true, role: true } },
                manager: { select: { id: true, name: true, email: true, role: true } },
            },
        });
        return {
            message: 'Manager assigned successfully',
            relation: {
                id: relation.id,
                employeeId: relation.employee_id,
                managerId: relation.manager_id,
                employee: relation.employee,
                manager: relation.manager,
            },
        };
    }
    async removeManager(adminId, employeeId, managerId) {
        const adminUser = await this.prisma.user.findUnique({
            where: { id: adminId },
        });
        if (!adminUser || adminUser.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only admins can remove managers');
        }
        const relation = await this.prisma.managerRelation.findUnique({
            where: {
                employee_id_manager_id: {
                    employee_id: employeeId,
                    manager_id: managerId,
                },
            },
        });
        if (!relation) {
            throw new common_1.NotFoundException('Manager-employee relationship not found');
        }
        await this.prisma.managerRelation.delete({
            where: { id: relation.id },
        });
        return {
            message: 'Manager removed successfully',
        };
    }
    async updateUserRole(adminUserId, targetUserId, newRole) {
        const adminUser = await this.prisma.user.findUnique({
            where: { id: adminUserId },
        });
        if (!adminUser || adminUser.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Only admins can update user roles');
        }
        if (adminUserId === targetUserId) {
            throw new common_1.ForbiddenException('You cannot change your own role');
        }
        if (!['ADMIN', 'MANAGER', 'EMPLOYEE'].includes(newRole)) {
            throw new common_1.BadRequestException('Invalid role specified');
        }
        const targetUser = await this.prisma.user.findFirst({
            where: {
                id: targetUserId,
                company_id: adminUser.company_id,
            },
        });
        if (!targetUser) {
            throw new common_1.NotFoundException('User not found in your company');
        }
        if (targetUser.role === 'MANAGER' && newRole !== 'MANAGER') {
            await this.prisma.managerRelation.deleteMany({
                where: { manager_id: targetUserId },
            });
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: targetUserId },
            data: { role: newRole },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                is_active: true,
                is_temp_password: true,
                updated_at: true,
            },
        });
        return {
            message: `User role updated successfully to ${newRole}`,
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                companyId: targetUser.company_id,
                isActive: updatedUser.is_active,
                isTempPassword: updatedUser.is_temp_password,
                updatedAt: updatedUser.updated_at?.toISOString(),
            },
        };
    }
    async getUserManagers(requesterId, userId) {
        const requester = await this.prisma.user.findUnique({ where: { id: requesterId } });
        if (!requester) {
            throw new common_1.UnauthorizedException('Invalid user');
        }
        if (requesterId !== userId && requester.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Can only view your own managers unless you are an admin');
        }
        const relations = await this.prisma.managerRelation.findMany({
            where: { employee_id: userId },
            include: {
                manager: { select: { id: true, name: true, email: true, role: true } },
            },
        });
        return relations.map(relation => ({
            id: relation.id,
            employeeId: relation.employee_id,
            managerId: relation.manager_id,
            manager: relation.manager,
        }));
    }
    async getUserEmployees(requesterId, managerId) {
        const requester = await this.prisma.user.findUnique({ where: { id: requesterId } });
        if (!requester) {
            throw new common_1.UnauthorizedException('Invalid user');
        }
        if (requesterId !== managerId && requester.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Can only view your own employees unless you are an admin');
        }
        const relations = await this.prisma.managerRelation.findMany({
            where: { manager_id: managerId },
            include: {
                employee: { select: { id: true, name: true, email: true, role: true } },
            },
        });
        return relations.map(relation => ({
            id: relation.id,
            employeeId: relation.employee_id,
            managerId: relation.manager_id,
            employee: relation.employee,
        }));
    }
    generateRandomPassword() {
        const length = 12;
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], UsersService);
//# sourceMappingURL=users.service.js.map