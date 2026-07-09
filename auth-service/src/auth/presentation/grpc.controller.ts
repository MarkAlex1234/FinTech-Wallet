// auth-service\src\auth\presentation\grpc.controller.ts (fixed return type and implementation)
import { Controller, Logger, BadRequestException } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { AuthService } from "../application/auth.service";

interface GetUserContactRequest {
  userId: string;
}

interface GetUserContactResponse {
  email: string;
  phone: string;
}

@Controller()
export class GrpcController {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new Logger(GrpcController.name);

  @GrpcMethod("AuthService", "GetUserContact")
  async getUserContactGrpc(data: GetUserContactRequest): Promise<GetUserContactResponse> {
    this.logger.debug(`GetUserContact called with data: ${JSON.stringify(data)}`);
    return this.authService.getUserContact(data.userId);
  }
}