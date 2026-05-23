import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";

import * as bcrypt from "bcrypt";
import { NurseStatusType } from "@prisma/client";

import { PrismaService } from "@infra/database/prisma.service";

import { CreateUserDto } from "../dto/create-user.dto";

import { UpdateUserDto } from "../dto/update-user.dto";
import { randomUUID } from "node:crypto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  /*
  |--------------------------------------------------------------------------
  | CREATE USER
  |--------------------------------------------------------------------------
  */

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        ...createUserDto,

        password: hashedPassword,

        status: "ACTIVE",
        auditLogId: randomUUID()
      },

      include: {
        roles: true,
        organization: true,
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | FIND ALL
  |--------------------------------------------------------------------------
  */

  async findAll(query: any, user: any) {
    const page = Number(query.page || 1);

    const limit = Number(query.limit || 10);

    const skip = (page - 1) * limit;

    const isSuperAdmin = user.role === "SUPER";

    const where: any = {};

    if (!isSuperAdmin) {
      where.organizationId =
        user.organizationId;
    }

    if (query.search) {
      where.OR = [
        {
          firstName: {
            contains: query.search,
            mode: "insensitive",
          },
        },

        {
          lastName: {
            contains: query.search,
            mode: "insensitive",
          },
        },

        {
          email: {
            contains: query.search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,

        skip,

        take: limit,
        include: {
          roles: true,
          organization: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      }),

      this.prisma.user.count({
        where,
      }),
    ]);

    return {
      data,

      meta: {
        total,

        page,

        limit,

        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /*
  |--------------------------------------------------------------------------
  | FIND ONE
  |--------------------------------------------------------------------------
  */

  async findOne(id: string, user: any) {
    const isSuperAdmin = user.role === "SUPER"
    const record = await this.prisma.user.findUnique({
      where: isSuperAdmin ? {
        id,
      } : { id: id, organizationId: user.organizationId },
      include: {
        roles: true,
        organization: true,
      },
    });

    if (!record) {
      throw new NotFoundException("User not found");
    }

    return record;
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE USER
  |--------------------------------------------------------------------------
  */

  async update(id: string, updateUserDto: UpdateUserDto, user: any) {
    await this.findOne(id, user);

    return this.prisma.user.update({
      where: {
        id,
      },

      data: updateUserDto,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | SOFT DELETE
  |--------------------------------------------------------------------------
  */

  async remove(id: string, user: any) {
    await this.findOne(id, user);

    return this.prisma.user.update({
      where: {
        id,
      },

      data: {
        status: "INACTIVE",
      },
      select: { id: true, email: true },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | CHANGE STATUS
  |--------------------------------------------------------------------------
  */

  async changeStatus(id: string, status: string) {
    return this.prisma.user.update({
      where: {
        id,
      },

      data: {
        status: status as NurseStatusType,
      },
    });
  }
}
