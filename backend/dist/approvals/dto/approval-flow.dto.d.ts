import { ApproverRole } from '@prisma/client';
export declare class CreateApprovalFlowDto {
    stepOrder: number;
    approverRole: ApproverRole;
    specificUserId?: number;
    isManagerApprover?: boolean;
}
export declare class UpdateApprovalFlowDto {
    stepOrder?: number;
    approverRole?: ApproverRole;
    specificUserId?: number;
    isManagerApprover?: boolean;
}
