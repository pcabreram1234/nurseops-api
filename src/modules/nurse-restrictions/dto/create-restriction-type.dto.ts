import { IsBoolean, IsEnum, IsString } from "class-validator";

import {
  NurseRestrictionTypes,
  NurseRestrictionDescriptions,
  PriorityTypes,
} from "@prisma/client";

export class CreateRestrictionTypeDto {
  @IsString()
  code!: string;

  @IsEnum(NurseRestrictionTypes)
  name!: NurseRestrictionTypes;

  @IsEnum(NurseRestrictionDescriptions)
  description!: NurseRestrictionDescriptions;

  @IsEnum(PriorityTypes)
  severity!: PriorityTypes;

  @IsBoolean()
  affects_scheduler!: boolean;

  @IsBoolean()
  affects_overtime!: boolean;

  @IsBoolean()
  affects_nights!: boolean;

  @IsBoolean()
  isSystem!: boolean;

  @IsBoolean()
  isActive!: boolean;
}
