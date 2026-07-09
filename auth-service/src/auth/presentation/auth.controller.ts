import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthService } from "../application/auth.service";
import { RefreshDto } from "./dto/refresh.dto";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { KycSubmitDto } from "./dto/kyc.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { EmailVerificationDto } from "./dto/email-verify.dto";
import { VerifyPhoneDto } from "./dto/phone-verify.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiBody({ type: RegisterDto })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Get("login")
  @ApiOperation({ summary: "Login a user and get tokens" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized (invalid credentials)",
  })
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.CREATED)
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Post("refresh")
  @ApiOperation({ summary: "Refresh access token using refresh token" })
  @ApiResponse({ status: 200, description: "New access token issued" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized (invalid refresh token)",
  })
  @ApiBody({ type: RefreshDto })
  async refresh(@Body() dto: RefreshDto) {
    await this.authService.refresh(dto);
  }

  @Post("logout")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: "Logout user by revoking refresh token" })
  @ApiResponse({ status: 200, description: "Logged out successfully" })
  @ApiBody({ type: RefreshDto })
  async logout(@Body() dto: RefreshDto) {
    await this.authService.logout(dto.refreshToken);
  }

  @Post("kyc/submit/")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: "" })
  @ApiResponse({ status: 200, description: "KYC submitted" })
  @ApiConsumes("multipart/form-data") // Tells Swagger it's file upload
  @UseInterceptors(
    FileInterceptor("file", {
      // 'file' is the form field name
      // storage: diskStorage({
      //   destination: './uploads/kyc', // Local folder; create it or use S3
      //   filename: (req, file, cb) => {
      //     cb(null, `${Date.now()}-${file.originalname}`); // Unique name
      //   },
      // }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
          cb(new Error("Unsupported file type"), false);
        } else {
          cb(null, true);
        }
      },
    })
  )
  @ApiBody({ type: KycSubmitDto })
  async submitKyc(@Req() req, @Body() dto: KycSubmitDto, @UploadedFile() file) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    const userId = req.user.userId;
    if (!userId) {
      throw new ForbiddenException("Invalid user context");
    }
    return await this.authService.submitKyc(userId, dto);
  }

  @Get("kyc/status/")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: "Get KYC status" })
  @ApiResponse({ status: 200, description: "" })
  async getKycStatus(@Req() req) {
    const userId = req.user.userId;
    if (!userId) {
      throw new ForbiddenException("Invalid user context");
    }
    return await this.authService.getKycStatus(userId);
  }

  @Post("mfa/enable")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: "Enable MFA" })
  @ApiResponse({ status: 200, description: "MFA enabled" })
  async enableMfa(@Req() req) {
    const userId = req.user.userId;
    if (!userId) {
      throw new ForbiddenException("Invalid user context");
    }
    return await this.authService.enableMFA(userId);
  }

  @Post("forget-password")
  @ApiOperation({ summary: "Forget" })
  @ApiResponse({ status: 200, description: "MFA enabled" })
  async forgetPassword(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException("Email should not be empty");
    }
    return await this.authService.sendForgetPasswordCode(body.email);
  }

  @Post("email-verify")
  @ApiOperation({ summary: "Enable MFA" })
  @ApiResponse({ status: 200, description: "MFA enabled" })
  async requestVerifyEmail(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException("Email should not be empty");
    }
    return await this.authService.sendEmailverifyCode(body.email);
  }

  @Post("phone-verify")
  async requestPhoneVerify(@Body() body: { phone: string }) {
    if (!body.phone) {
      throw new BadRequestException("phone should not be empty");
    }
    return await this.authService.sendPhoneverifyCode(body.phone);
  }

  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto);
  }

  @Post("verify-email")
  async verifyEmail(@Body() dto: EmailVerificationDto) {
    return await this.authService.verifyEmailOtp(dto);
  }

  @Post("verify-phone")
  async verifyPhone(@Body() dto: VerifyPhoneDto) {
    return await this.authService.verifyPhoneOtp(dto);
  }

  @Post("mfa/verify")
  async verifyMFA(
    @Body() dto: { token: string },
    @Headers("authorization") authHeader: string
  ) {
    const tempToken = authHeader?.replace("Bearer ", "");
    if (!tempToken) throw new BadRequestException("Temp token required");
    return await this.authService.verifyMFA(dto, tempToken);
  }
}
