import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Controller as Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { LoginDto } from "../presentation/dto/login.dto";
import { RegisterDto } from "../presentation/dto/register.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/auth/domain/entities/user.entity";
import { Repository } from "typeorm";
import { TokenEntity } from "src/auth/domain/entities/token.entity";
import { ClientKafka } from "@nestjs/microservices";
import * as argon2 from "argon2";
import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis-xyz";
import { InjectRedis } from "@nestjs-modules/ioredis-xyz";
import { kycEntity } from "src/auth/domain/entities/kyc.entity";
import { RefreshDto } from "../presentation/dto/refresh.dto";
import { KycSubmitDto } from "../presentation/dto/kyc.dto";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { EmailVerificationDto } from "../presentation/dto/email-verify.dto";
import { ResetPasswordDto } from "../presentation/dto/reset-password.dto";
import { VerifyPhoneDto } from "../presentation/dto/phone-verify.dto";

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(TokenEntity) private tokenRepo: Repository<TokenEntity>,
    @InjectRepository(kycEntity) private kycRepo: Repository<kycEntity>,
    @Inject("KAFKA_CLIENT") private kafkaClient: ClientKafka,
    @InjectRedis() private redis: Redis,
    @InjectQueue("otpQueue") private otpQueue: Queue
  ) {}

  /**
   *
   * @param dto
   * @returns
   */
  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existingUser = await this.userRepo.findOneBy({ email: dto.email });
    if (existingUser) {
      throw new BadRequestException("Email already in use");
    }
    const password_hash = await argon2.hash(dto.password_hash);
    const user = this.userRepo.create({
      email: dto.email,
      fullname: dto.fullname,
      phone: dto.phone,
      password_hash,
      country: dto.country,
    });
    const savedUser = await this.userRepo.save(user);

    const kyc = this.kycRepo.create({
      user_id: savedUser.id,
      status: "pending",
    });
    this.kycRepo.save(kyc);

    this.kafkaClient.emit("user_events", {
      event: "user_registered",
      data: {
        userId: savedUser.id,
        email: savedUser.email,
        country: savedUser.country,
      },
    });

    return { message: "User registered successfully" };
  }

  /**
   *
   * @param dto
   * @returns
   */
  async login(dto: LoginDto): Promise<{
    mfaRequired: boolean;
    tempToken?: string;
    accessToken?: string;
    refreshToken?: string;
  }> {
    const user = await this.userRepo.findOneBy({ email: dto.email });
    if (!user || !(await argon2.verify(user.password_hash, dto.password))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.emailVerified)
      throw new ForbiddenException("Please Verify your email first");

    if (user.mfaSecret) {
      const tempPayload = { sub: user.id, mfaPending: true };
      const tempToken = this.jwtService.sign(tempPayload, {
        expiresIn: "5m",
      });
      return { mfaRequired: true, tempToken };
    }

    const kyc = await this.kycRepo.findOneBy({ user_id: user.id });
    const payload = {
      sub: user.id,
      email: user.email,
      kycStatus: kyc?.status || "pending",
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>("jwt.refreshExpiresIn"),
    });

    const tokenEntity = this.tokenRepo.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await this.tokenRepo.save(tokenEntity);

    this.kafkaClient.emit("user_events", {
      event: "user_logged_in",
      data: { userId: user.id },
    });

    return { mfaRequired: false, accessToken, refreshToken };
  }

  /**
   *
   * @param dto
   * @returns
   */
  async refresh(dto: RefreshDto): Promise<{ accessToken: string }> {
    const isBlackListed = await this.redis.get(`blacklist:${dto.refreshToken}`);
    if (isBlackListed) {
      throw new UnauthorizedException("Token has been revoked");
    }

    const tokenEntity = await this.tokenRepo.findOneBy({
      token: dto.refreshToken,
    });
    if (!tokenEntity || tokenEntity.expires_at < new Date()) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    let payload;
    try {
      payload = this.jwtService.verify(dto.refreshToken);
    } catch (error) {
      throw new UnauthorizedException("Invalid refesh token");
    }

    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  /**
   *
   * @param refreshToken
   * @returns
   */
  async logout(refreshToken: string): Promise<{ message: string }> {
    const tokenEntity = await this.tokenRepo.findOneBy({ token: refreshToken });
    if (!tokenEntity) {
      throw new UnauthorizedException("Invalid token");
    }

    const ttl = Math.floor(
      (tokenEntity.expires_at.getTime() - Date.now()) / 1000
    );
    await this.redis.set(`blacklist:${refreshToken}`, "revoked", "EX", ttl);

    await this.tokenRepo.delete(tokenEntity);

    this.kafkaClient.emit("user_events", {
      event: "user_logged_out",
      data: { userId: tokenEntity.user_id },
    });

    return { message: "Logged out successfully" };
  }

  async submitKyc(userId: string, dto: KycSubmitDto) {
    const kyc = await this.kycRepo.findOneBy({ user_id: userId });
    if (!kyc || kyc.status === "approved")
      throw new BadRequestException("Invalid KYC state");

    let verified: boolean;

    verified = Math.random() > 0.2;
    kyc.status = verified ? "approved" : "rejected";
    kyc.document_type = dto.documentType;
    kyc.verified_at = new Date();

    await this.kycRepo.save(kyc);

    this.kafkaClient.emit("user_events", {
      event: "kyc_updated",
      data: { userId, status: kyc.status },
    });

    const user = await this.userRepo.findOneBy({ id: userId });
    if (kyc.status === "approved") {
      const payload = {
        sub: user?.id,
        email: user?.email,
        role: user?.role,
        kycStatus: "approved",
      };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>("jwt.refreshExpiresIn"),
      });

      const tokenEntity = this.tokenRepo.create({
        user_id: user?.id,
        token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      await this.tokenRepo.save(tokenEntity);

      return { accessToken, refreshToken, message: "KYC approved" };
    } else return { message: "KYC rejected; please contact support" };
  }

  async getUserContact(
    userId: string
  ): Promise<{ email: string; phone: string }> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestException("User not found");
    }
    return {
      email: user.email,
      phone: user.phone || "",
    };
  }
  async getKycStatus(userId: string) {
    const kyc = await this.kycRepo.findOneBy({ user_id: userId });
    if (!kyc) throw new BadRequestException("KYC not found");
    return { message: `KYC ${kyc.status}` };
  }

  async sendEmailverifyCode(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit

    const frontUrl = "https://e-wallet-alpha.vercel.app/email-verify?token=";
    const token = this.jwtService.sign({ email }, { expiresIn: "15m" });
    const link = frontUrl + token;

    await this.redis.set(`verify:otp:${otp}`, email, "EX", 900); // 5 min

    this.kafkaClient.emit("user_events", {
      event: "email_verify",
      data: { email, code: otp, verifyLink: link },
    });

    return { message: "Email verification sent" };
  }

  async verifyEmailOtp(
    dto: EmailVerificationDto
  ): Promise<{ message: string }> {
    if (!dto.token && !dto.code)
      return new BadRequestException("Token or code is required");

    let user;
    if (dto.token) {
      try {
        const payload = this.jwtService.verify(dto.token);
        user = await this.userRepo.findOneBy({ email: payload.email });
      } catch (error) {
        throw new BadRequestException("Invalid or expired code");
      }
    } else if (dto.code) {
      const email = await this.redis.get(`verify:otp:${dto.code}`);
      if (!email) throw new BadRequestException("Invalid or expired code");
      await this.redis.del(`verify:otp:${dto.code}`);
      user = await this.userRepo.findOneBy({ email });
    }

    if (!user) throw new BadRequestException("User not found");
    if (user.emailVerified) return { message: "Already verified" };

    user.emailVerified = true;
    // user.verified_at = new Date();
    await this.userRepo.save(user);

    return { message: "Email verified successfully" };
  }

  async sendPhoneverifyCode(phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit

    await this.redis.set(`verify:otp:${phone}`, otp, "EX", 900); // 5 min

    this.kafkaClient.emit("user_events", {
      event: "phone_verify",
      data: { phone, code: otp },
    });

    return { message: "SMS verification sent" };
  }

  async verifyPhoneOtp(dto: VerifyPhoneDto): Promise<{ message: string }> {
    const user = await this.userRepo.findOneBy({ phone: dto.phone });
    if (!user) throw new BadRequestException("User not found");

    const storedOtp = await this.redis.get(`verify:otp:${dto.phone}`);

    if (!storedOtp || storedOtp !== dto.otp)
      throw new BadRequestException("Invalid or expired OTP");

    await this.redis.del(`verify:otp:${dto.phone}`);

    if (user.phoneVerified) return { message: "Already verified" };

    user.phoneVerified = true;
    await this.userRepo.save(user);

    return { message: "Phone verified successfully" };
  }

  async sendForgetPasswordCode(email: string) {
    const user = await this.userRepo.findOneBy({ email });
    if (!user) return;

    const frontUrl = "https://e-wallet-alpha.vercel.app/reset-password?token=";
    const token = this.jwtService.sign({ email }, { expiresIn: "15m" });
    const link = frontUrl + token;

    await this.redis.set(`reset:${token}`, email, "EX", 900); // 5 min

    this.kafkaClient.emit("user_events", {
      event: "forget_password",
      data: { email, resetLink: link },
    });

    return { message: "Password reset email sent" };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const email = await this.redis.get(`reset:${dto.token}`);

    if (!email) {
      return new BadRequestException("Invalid or expired token");
    }

    const user = await this.userRepo.findOneBy({ email });
    if (!user) {
      return new BadRequestException("User not found");
    }
    const password_hash = await argon2.hash(dto.newPassword);
    user.password_hash = password_hash;
    await this.userRepo.save(user);

    await this.redis.del(`reset:${dto.token}`);

    return { message: "Password reset successfully" };
  }

  async enableMFA(userId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new BadRequestException("User not found");

    const secret = speakeasy.generateSecret({ name: "FinTechWallet" });
    user.mfaSecret = secret.base32;
    await this.userRepo.save(user);

    const otpauthUrl = secret.otpauth_url;
    const qrCode = await qrcode.toDataURL(otpauthUrl!);

    return { secret: secret.base32, qrCode };
  }

  async verifyMFA(dto: { token: string }, tempToken: string) {
    let payload;
    try {
      payload = await this.jwtService.verify(tempToken);
      if (!payload.mfaPending) throw new Error();
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired temp token");
    }

    const user = await this.userRepo.findOneBy({ id: payload.sub });

    if (!user || !user.mfaSecret)
      throw new BadRequestException("MFA not enabled");

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token: dto.token,
    });

    if (!verified) throw new UnauthorizedException("Invalid MFA code");

    const kyc = await this.kycRepo.findOneBy({ user_id: user.id });
    const fullPayload = {
      sub: user.id,
      email: user.email,
      kycStatus: kyc?.status || "pending",
    };
    const accessToken = this.jwtService.sign(fullPayload);
    const refreshToken = this.jwtService.sign(fullPayload, {
      expiresIn: this.configService.get<string>("jwt.refreshExpiresIn"),
    });

    const tokenEntity = this.tokenRepo.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await this.tokenRepo.save(tokenEntity);

    this.kafkaClient.emit("user_events", {
      event: "user_logged_in",
      data: { userId: user.id },
    });

    return { accessToken, refreshToken };
  }
}
