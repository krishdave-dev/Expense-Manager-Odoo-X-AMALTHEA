import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private prisma;
    private mailService;
    constructor(prisma: PrismaService, mailService: MailService);
    createUser(adminUserId: number, createUserDto: CreateUserDto): Promise<{
        message: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            companyId: number;
            isActive: boolean;
            isTempPassword: boolean;
            createdAt: string;
        };
        tempPassword: any;
        emailError?: undefined;
    } | {
        message: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            companyId: number;
            isActive: boolean;
            isTempPassword: boolean;
            createdAt: string;
        };
        tempPassword: string;
        emailError: string;
    }>;
    getAllUsers(adminUserId: number): Promise<{
        users: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            companyId: number;
            isActive: boolean;
            isTempPassword: boolean;
            createdAt: string;
            updatedAt: string;
            managers: {
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
                id: number;
            }[];
        }[];
        total: number;
    }>;
    getUserProfile(userId: number): Promise<{
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        is_active: boolean;
        is_temp_password: boolean;
        created_at: Date;
        updated_at: Date;
        company: {
            name: string;
            id: number;
            country: string;
            currency_code: string;
            currency_symbol: string;
        };
        id: number;
    }>;
    updateUserStatus(adminUserId: number, targetUserId: number, isActive: boolean): Promise<{
        message: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            companyId: number;
            isActive: boolean;
            isTempPassword: boolean;
            updatedAt: string;
        };
        emailSent: boolean;
        emailError?: undefined;
    } | {
        message: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            companyId: number;
            isActive: boolean;
            isTempPassword: boolean;
            updatedAt: string;
        };
        emailSent: boolean;
        emailError: string;
    }>;
    assignManager(adminId: number, employeeId: number, managerId: number): Promise<{
        message: string;
        relation: {
            id: number;
            employeeId: number;
            managerId: number;
            employee: {
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
                id: number;
            };
            manager: {
                name: string;
                email: string;
                role: import(".prisma/client").$Enums.Role;
                id: number;
            };
        };
    }>;
    removeManager(adminId: number, employeeId: number, managerId: number): Promise<{
        message: string;
    }>;
    getUserManagers(requesterId: number, userId: number): Promise<{
        id: number;
        employeeId: number;
        managerId: number;
        manager: {
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            id: number;
        };
    }[]>;
    getUserEmployees(requesterId: number, managerId: number): Promise<{
        id: number;
        employeeId: number;
        managerId: number;
        employee: {
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            id: number;
        };
    }[]>;
    private generateRandomPassword;
}
