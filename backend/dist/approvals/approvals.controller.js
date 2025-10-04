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
exports.ApprovalsController = void 0;
const common_1 = require("@nestjs/common");
const approvals_service_1 = require("./approvals.service");
const approve_expense_dto_1 = require("./dto/approve-expense.dto");
const approval_flow_dto_1 = require("./dto/approval-flow.dto");
const approval_rule_dto_1 = require("./dto/approval-rule.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorators_1 = require("../common/decorators/roles.decorators");
const user_decorator_1 = require("../auth/decorators/user.decorator");
const client_1 = require("@prisma/client");
let ApprovalsController = class ApprovalsController {
    constructor(approvalsService) {
        this.approvalsService = approvalsService;
    }
    approve(expenseId, dto, user) {
        return this.approvalsService.approveExpense(+expenseId, user.id, dto);
    }
    getPending(user) {
        return this.approvalsService.getPendingApprovals(user.id);
    }
    async setupApprovalFlow(companyId) {
        return this.approvalsService.setupDefaultApprovalFlow(+companyId);
    }
    async getAllApprovals() {
        return this.approvalsService.getAllApprovalsDebug();
    }
    getApprovalFlows(user) {
        return this.approvalsService.getApprovalFlows(user.id);
    }
    createApprovalFlow(user, flowData) {
        return this.approvalsService.createApprovalFlow(user.id, flowData);
    }
    updateApprovalFlow(flowId, user, flowData) {
        return this.approvalsService.updateApprovalFlow(flowId, user.id, flowData);
    }
    deleteApprovalFlow(flowId, user) {
        return this.approvalsService.deleteApprovalFlow(flowId, user.id);
    }
    getApprovalRules(user) {
        return this.approvalsService.getApprovalRules(user.id);
    }
    createApprovalRule(user, ruleData) {
        return this.approvalsService.createApprovalRule(user.id, ruleData);
    }
    updateApprovalRule(ruleId, user, ruleData) {
        return this.approvalsService.updateApprovalRule(ruleId, user.id, ruleData);
    }
    deleteApprovalRule(ruleId, user) {
        return this.approvalsService.deleteApprovalRule(ruleId, user.id);
    }
};
exports.ApprovalsController = ApprovalsController;
__decorate([
    (0, common_1.Post)(':expenseId/approve'),
    __param(0, (0, common_1.Param)('expenseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approve_expense_dto_1.ApproveExpenseDto, Object]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "approve", null);
__decorate([
    (0, common_1.Get)('pending'),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "getPending", null);
__decorate([
    (0, common_1.Post)('setup-flow/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ApprovalsController.prototype, "setupApprovalFlow", null);
__decorate([
    (0, common_1.Get)('debug/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApprovalsController.prototype, "getAllApprovals", null);
__decorate([
    (0, common_1.Get)('flows'),
    (0, roles_decorators_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "getApprovalFlows", null);
__decorate([
    (0, common_1.Post)('flows'),
    (0, roles_decorators_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, approval_flow_dto_1.CreateApprovalFlowDto]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "createApprovalFlow", null);
__decorate([
    (0, common_1.Patch)('flows/:id'),
    (0, roles_decorators_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, approval_flow_dto_1.UpdateApprovalFlowDto]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "updateApprovalFlow", null);
__decorate([
    (0, common_1.Delete)('flows/:id'),
    (0, roles_decorators_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "deleteApprovalFlow", null);
__decorate([
    (0, common_1.Get)('rules'),
    (0, roles_decorators_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "getApprovalRules", null);
__decorate([
    (0, common_1.Post)('rules'),
    (0, roles_decorators_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, approval_rule_dto_1.CreateApprovalRuleDto]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "createApprovalRule", null);
__decorate([
    (0, common_1.Patch)('rules/:id'),
    (0, roles_decorators_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, approval_rule_dto_1.UpdateApprovalRuleDto]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "updateApprovalRule", null);
__decorate([
    (0, common_1.Delete)('rules/:id'),
    (0, roles_decorators_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "deleteApprovalRule", null);
exports.ApprovalsController = ApprovalsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('approvals'),
    __metadata("design:paramtypes", [approvals_service_1.ApprovalsService])
], ApprovalsController);
//# sourceMappingURL=approvals.controller.js.map