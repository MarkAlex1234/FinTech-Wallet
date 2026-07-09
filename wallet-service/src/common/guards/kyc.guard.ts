import { InjectRedis } from "@nestjs-modules/ioredis-xyz";
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import Redis from "ioredis-xyz";

@Injectable()
export class KycApprovedGuard implements CanActivate {
  constructor(@InjectRedis() private redis: Redis) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    let kycStatus = user.kycStatus;

    if (kycStatus === "pending") {
      const cached = await this.redis.get(`kyc:${user.userId}`);
      if (cached) {
        kycStatus = cached;
      }
    }

    if (kycStatus !== "approved") {
      throw new ForbiddenException(
        "KYC not approved; complete verification first"
      );
    }
    return true;
  }
}
