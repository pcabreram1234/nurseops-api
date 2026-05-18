import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@infra/database/prisma.service';

import { CreatePermissionDto } from '../dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */

  async create(
    createPermissionDto: CreatePermissionDto,
  ) {
    const existing =
      await this.prisma.permission.findFirst({
        where: {
          name: createPermissionDto.name,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Permission already exists',
      );
    }

    return this.prisma.permission.create({
      data: createPermissionDto,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | FIND ALL
  |--------------------------------------------------------------------------
  */

  async findAll(query: any) {
    const where: any = {};

    if (query.search) {
      where.name = {
        contains: query.search,

        mode: 'insensitive',
      };
    }

    if (query.module) {
      where.module = query.module;
    }

    return this.prisma.permission.findMany({
      where,

      orderBy: [
        {
          module: 'asc',
        },

        {
          name: 'asc',
        },
      ],
    });
  }

  /*
  |--------------------------------------------------------------------------
  | FIND ONE
  |--------------------------------------------------------------------------
  */

  async findOne(id: string) {
    const permission =
      await this.prisma.permission.findUnique({
        where: {
          id,
        },
      });

    if (!permission) {
      throw new NotFoundException(
        'Permission not found',
      );
    }

    return permission;
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

  async update(
    id: string,

    body: any,
  ) {
    await this.findOne(id);

    return this.prisma.permission.update({
      where: {
        id,
      },

      data: body,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.permission.delete({
      where: {
        id,
      },
    });
  }
}