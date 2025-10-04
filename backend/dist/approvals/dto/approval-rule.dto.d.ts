import { RuleType } from '@prisma/client';
export declare class CreateApprovalRuleDto {
    ruleType: RuleType;
    percentageThreshold?: number;
    specificApproverId?: number;
    hybridCondition?: any;
}
export declare class UpdateApprovalRuleDto {
    ruleType?: RuleType;
    percentageThreshold?: number;
    specificApproverId?: number;
    hybridCondition?: any;
}
