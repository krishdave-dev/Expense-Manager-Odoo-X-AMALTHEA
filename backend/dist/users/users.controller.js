"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_role_dto_1 = require("./dto/update-role.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorators_1 = require("../common/decorators/roles.decorators");
const user_decorator_1 = require("../auth/decorators/user.decorator");
const client_1 = require("@prisma/client");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async createUser(user, createUserDto) {
        return this.usersService.createUser(user.id, createUserDto);
    }
    async getAllUsers(user) {
        return this.usersService.getAllUsers(user.id);
    }
    async getUserProfile(user) {
        return this.usersService.getUserProfile(user.id);
    }
    async getCompanyInfo(user) {
        return this.usersService.getCompanyInfo(user.id);
    }
    async updateUserStatus(user, targetUserId, isActive) {
        return this.usersService.updateUserStatus(user.id, targetUserId, isActive);
    }
    async updateUserRole(user, targetUserId, updateRoleDto) {
        return this.usersService.updateUserRole(user.id, targetUserId, updateRoleDto.role);
    }
    async assignManager(user, employeeId, managerId) {
        return this.usersService.assignManager(user.id, employeeId, managerId);
    }
    async removeManager(user, employeeId, managerId) {
        return this.usersService.removeManager(user.id, employeeId, managerId);
    }
    async getUserManagers(user, userId) {
        return this.usersService.getUserManagers(user.id, userId);
    }
    async getUserEmployees(user, managerId) {
        return this.usersService.getUserEmployees(user.id, managerId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorators_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorators_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserProfile", null);
__decorate([
    (0, common_1.Get)('company'),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCompanyInfo", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorators_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Boolean]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Patch)(':id/role'),
    (0, roles_decorators_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_role_dto_1.UpdateRoleDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Post)(':employeeId/manager/:managerId'),
    (0, roles_decorators_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('employeeId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('managerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "assignManager", null);
__decorate([
    (0, common_1.Delete)(':employeeId/manager/:managerId'),
    (0, roles_decorators_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('employeeId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('managerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "removeManager", null);
__decorate([
    (0, common_1.Get)(':id/managers'),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserManagers", null);
__decorate([
    (0, common_1.Get)(':id/employees'),
    (0, roles_decorators_1.Roles)(client_1.Role.MANAGER, client_1.Role.ADMIN),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserEmployees", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map