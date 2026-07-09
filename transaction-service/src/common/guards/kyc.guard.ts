import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

export class KycApprovedGuard implements CanActivate {

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
   
    if (user.kycStatus !== "approved") {
      throw new ForbiddenException(
        "KYC not approved; complete verification first"
      );
    }
    return true;
  }
}
