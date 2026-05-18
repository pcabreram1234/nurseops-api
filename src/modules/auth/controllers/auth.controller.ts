import { Body, Controller, Patch, Post, Req, UseGuards } from "@nestjs/common";

import { AuthService } from "../services/auth.service";

import { LoginDto } from "../dto/login.dto";

import { RegisterDto } from "../dto/register.dto";

import { LogOutDto } from "../dto/logout.dto";

import { ChangePasswordDto } from "../dto/changePassword.dto";

import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@Controller({
  path: "auth",

  version: "1",
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  async logout(@Body() logoutDto: LogOutDto) {
    return this.authService.logout(logoutDto.userId);
  }

  @Patch("change-password")
  @UseGuards(JwtAuthGuard) // 🔒 Protegido: Solo el usuario dueño de la cuenta puede hacer esto
  async changePassword(
    @Req() req: any, // Usamos 'any' o una interfaz extendida para acceder a req.user.id de forma limpia
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    // 🛠️ Extraemos el userId de forma segura desde el JWT
    const userId = req.user.id;

    return this.authService.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }
}
