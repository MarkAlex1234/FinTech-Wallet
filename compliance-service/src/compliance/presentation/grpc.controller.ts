import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { ComplianceService } from "../application/compliance.service";

interface CheckRiskRequest {
  transactionId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
}
interface CheckRiskResponse {
  approved: boolean;
  riskScore: number;
}

@Controller()
export class GrpcController {

  constructor(private readonly complianceService: ComplianceService) {}

  @GrpcMethod("ComplianceService", "CheckRisk")
  async checkRiskGrpc(data: CheckRiskRequest): Promise<CheckRiskResponse> {
    const result = await this.complianceService.checkRisk({
      userId: data.fromUserId,
      transactionId: data.transactionId,
      fromUserId: data.fromUserId,
      toUserId: data.toUserId,
      amount: data.amount,
    });

    return result;
  }
}
