import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

import { ProviderList } from "@prisma/client";

export class CreateIntegrationDto {
  @IsString()
  organizationId!: string;

  @IsEnum(ProviderList)
  provider!: ProviderList;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsObject()
  configuration: any;
}
