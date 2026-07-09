import { Body, Controller, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ComplianceService } from "../application/compliance.service";
import { GrpcMethod } from "@nestjs/microservices";


@ApiTags("compliance")
@Controller("compliance")
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post("check")
  @ApiOperation({ summary: "Manual risk check (for testing)" })
  @ApiResponse({ status: 200, description: "Check result" })
  @ApiBody({ type: Object })
  async checkRiskRest(@Body() dto: any) {
    return await this.complianceService.checkRisk(dto);
  }
}
