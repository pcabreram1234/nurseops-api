import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";

import * as bcrypt from "bcrypt";
import { NurseStatusType } from "@prisma/client";

import { PrismaService } from "@infra/database/prisma.service";

import { CreateUserDto } from "../dto/create-user.dto";

import { UpdateUserDto } from "../dto/update-user.dto";
import { randomUUID } from "node:crypto";
import {
  assertBranchInOrganization,
  resolveDepartmentBranch,
} from "@common/utils/branch-scope";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  /*
  |--------------------------------------------------------------------------
  | CREATE USER
  |--------------------------------------------------------------------------
  */

  async create(createUserDto: CreateUserDto, user?: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    const organizationId =
      user?.organizationId || createUserDto.organizationId;

    if (!organizationId) {
      throw new BadRequestException("organizationId is required.");
    }

    let branchId = createUserDto.branchId;
    if (branchId) {
      if (createUserDto.departmentId) {
        branchId = await resolveDepartmentBranch(
          this.prisma,
          createUserDto.departmentId,
          organizationId,
          branchId,
        );
      } else {
        await assertBranchInOrganization(this.prisma, branchId, organizationId);
      }
    } else if (createUserDto.departmentId) {
      branchId = await resolveDepartmentBranch(
        this.prisma,
        createUserDto.departmentId,
        organizationId,
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        organizationId,
        ...(branchId ? { branchId } : {}),

        password: hashedPassword,

        status: "ACTIVE",
        auditLogId: randomUUID(),
      },

      include: {
        roles: true,
        organization: true,
        branch: true,
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

    if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,

        skip,

        take: limit,
        include: {
          roles: true,
          organization: true,
          branch: true,
        },

        orderBy: {
          createdAt: "desc",
        }, omit: {
          password: true,
          createdAt: true,
          lastLoginAt: true,

        }
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
        branch: true,
      }, omit: {
        password: true,
        createdAt: true,
        lastLoginAt: true,

      }
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
    const current = await this.findOne(id, user);

    const data: any = { ...updateUserDto };

    const departmentId = updateUserDto.departmentId ?? current.departmentId;

    if (updateUserDto.branchId || updateUserDto.departmentId) {
      if (departmentId) {
        data.branchId = await resolveDepartmentBranch(
          this.prisma,
          departmentId,
          current.organizationId,
          updateUserDto.branchId,
        );
      } else if (updateUserDto.branchId) {
        await assertBranchInOrganization(
          this.prisma,
          updateUserDto.branchId,
          current.organizationId,
        );
      }
    }

    return this.prisma.user.update({
      where: {
        id,
      },

      data,
      include: {
        branch: true,
      },
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
