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
let ApprovalsController = class ApprovalsController {
    constructor(approvalsService) {
        this.approvalsService = approvalsService;
    }
    approve(expenseId, dto, req) {
        const approverId = req.user?.id || req.user?.sub;
        if (!approverId) {
            throw new Error('User not authenticated');
        }
        return this.approvalsService.approveExpense(+expenseId, approverId, dto);
    }
    getPending(req) {
        const approverId = req.user?.id || req.user?.sub;
        if (!approverId) {
            throw new Error('User not authenticated');
        }
        return this.approvalsService.getPendingApprovals(approverId);
    }
    async setupApprovalFlow(companyId) {
        return this.approvalsService.setupDefaultApprovalFlow(+companyId);
    }
    async getAllApprovals() {
        return this.approvalsService.getAllApprovalsDebug();
    }
};
exports.ApprovalsController = ApprovalsController;
__decorate([
    (0, common_1.Post)(':expenseId/approve'),
    __param(0, (0, common_1.Param)('expenseId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approve_expense_dto_1.ApproveExpenseDto, Object]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "approve", null);
__decorate([
    (0, common_1.Get)('pending'),
    __param(0, (0, common_1.Request)()),
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
exports.ApprovalsController = ApprovalsController = __decorate([
    (0, common_1.Controller)('approvals'),
    __metadata("design:paramtypes", [approvals_service_1.ApprovalsService])
], ApprovalsController);
//# sourceMappingURL=approvals.controller.js.map