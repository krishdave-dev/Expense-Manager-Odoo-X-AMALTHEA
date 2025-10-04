import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    createUser(user: any, createUserDto: CreateUserDto): Promise<{
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
    getAllUsers(user: any): Promise<{
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
                email: string;
                name: string;
                id: number;
                role: import(".prisma/client").$Enums.Role;
            }[];
        }[];
        total: number;
    }>;
    getUserProfile(user: any): Promise<{
        company: {
            name: string;
            country: string;
            id: number;
            currency_code: string;
            currency_symbol: string;
        };
        email: string;
        name: string;
        id: number;
        role: import(".prisma/client").$Enums.Role;
        is_active: boolean;
        is_temp_password: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    updateUserStatus(user: any, targetUserId: number, isActive: boolean): Promise<{
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
    updateUserRole(user: any, targetUserId: number, updateRoleDto: UpdateRoleDto): Promise<{
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
    }>;
    assignManager(user: any, employeeId: number, managerId: number): Promise<{
        message: string;
        relation: {
            id: number;
            employeeId: number;
            managerId: number;
            employee: {
                email: string;
                name: string;
                id: number;
                role: import(".prisma/client").$Enums.Role;
            };
            manager: {
                email: string;
                name: string;
                id: number;
                role: import(".prisma/client").$Enums.Role;
            };
        };
    }>;
    removeManager(user: any, employeeId: number, managerId: number): Promise<{
        message: string;
    }>;
    getUserManagers(user: any, userId: number): Promise<{
        id: number;
        employeeId: number;
        managerId: number;
        manager: {
            email: string;
            name: string;
            id: number;
            role: import(".prisma/client").$Enums.Role;
        };
    }[]>;
    getUserEmployees(user: any, managerId: number): Promise<{
        id: number;
        employeeId: number;
        managerId: number;
        employee: {
            email: string;
            name: string;
            id: number;
            role: import(".prisma/client").$Enums.Role;
        };
    }[]>;
}
