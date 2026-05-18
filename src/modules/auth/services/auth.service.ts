import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";

import * as bcrypt from "bcrypt";

import { JwtService } from "@nestjs/jwt";

import { PrismaService } from "@infra/database/prisma.service";

import { LoginDto } from "../dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly jwtService: JwtService,
  ) {}

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */
  async login(loginDto: LoginDto) {
    // 1. Validamos las credenciales del usuario
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // 2. Buscamos al usuario en la BD incluyendo su rol y la tabla intermedia de permisos
    const userWithPermissions = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        roles: {
          // Asumiendo que tu relación en el modelo User se llama 'roles' o 'role'
          include: {
            rolePermissions: {
              include: {
                permissions: true, // Traemos la entidad final del permiso para sacar el campo 'code'
              },
            },
          },
        },
      },
    });

    // 3. Extraemos y aplanamos los códigos de los permisos en un arreglo de strings planos
    // Resultado esperado: ['CREATE_USER', 'UPDATE_SCHEDULE', ...]
    const permissions =
      userWithPermissions?.roles?.rolePermissions?.map(
        (rp) => rp.permissions.name,
      ) || [];

    // 4. Modificamos la generación de tokens para inyectar el rol y los permisos en el payload del JWT
    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.roles?.name, // "SUPER", "ADMIN", etc.
      organizationId: user.organizationId,
      permissions, // 👈 ¡CLAVE! Esto es lo que leerá tu PermissionsGuard
    });

    await this.updateLastLogin(user.id);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.firstName,
        role: user.roles?.name,
        organizationId: user.organizationId,
        permissions, // Lo devolvemos también para que el Frontend (React/Angular) sepa qué mostrar
      },
    };
  }
  /*
  |--------------------------------------------------------------------------
  | VALIDATE USER
  |--------------------------------------------------------------------------
  */

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },

      include: {
        roles: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (user.status !== "ACTIVE") {
      throw new UnauthorizedException("User inactive");
    }

    const passwordMatch = await this.comparePasswords(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return user;
  }

  /*
  |--------------------------------------------------------------------------
  | REGISTER
  |--------------------------------------------------------------------------
  */

  async register(data: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    const hashedPassword = await this.hashPassword(data.password);

    const user = await this.prisma.user.create({
      data: {
        ...data,

        password: hashedPassword,
      },
    });

    return user;
  }

  /*
  |--------------------------------------------------------------------------
  | HASH PASSWORD
  |--------------------------------------------------------------------------
  */

  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  /*
  |--------------------------------------------------------------------------
  | COMPARE PASSWORDS
  |--------------------------------------------------------------------------
  */

  async comparePasswords(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /*
  |--------------------------------------------------------------------------
  | GENERATE TOKENS
  |--------------------------------------------------------------------------
  */

  async generateTokens(user: any) {
    const payload = {
      sub: user.id,

      email: user.email,

      role: user.roles?.name,

      organizationId: user.organizationId,
    };

    const accessToken = await this.generateAccessToken(payload);

    const refreshToken = await this.generateRefreshToken(payload);

    await this.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,

      refreshToken,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | ACCESS TOKEN
  |--------------------------------------------------------------------------
  */

  async generateAccessToken(payload: any) {
    return this.jwtService.signAsync(payload, {
      expiresIn: "1d",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | REFRESH TOKEN
  |--------------------------------------------------------------------------
  */

  async generateRefreshToken(payload: any) {
    return this.jwtService.signAsync(payload, {
      expiresIn: "7d",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | SAVE REFRESH TOKEN
  |--------------------------------------------------------------------------
  */

  async saveRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashPassword(refreshToken);

    await this.prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        refreshToken: hashedRefreshToken,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | REFRESH ACCESS TOKEN
  |--------------------------------------------------------------------------
  */

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException("Access denied");
    }

    const refreshTokenMatches = await this.comparePasswords(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    return this.generateTokens(user);
  }

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  async logout(userId: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        refreshToken: "",
      },
    });

    return {
      message: "Logged out successfully",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | VALIDATE JWT USER
  |--------------------------------------------------------------------------
  */

  async validateJwtUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },

      include: {
        roles: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    if (user.status !== "ACTIVE") {
      throw new UnauthorizedException("User inactive");
    }

    return user;
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE LAST LOGIN
  |--------------------------------------------------------------------------
  */

  async updateLastLogin(userId: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | CHANGE PASSWORD
  |--------------------------------------------------------------------------
  */

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const passwordMatches = await this.comparePasswords(
      currentPassword,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException("Current password incorrect");
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await this.prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        password: hashedPassword,
      },
    });

    return {
      message: "Password updated successfully",
    };
  }
}
