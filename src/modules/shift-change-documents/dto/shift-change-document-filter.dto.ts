import { IsEnum, IsOptional, IsUUID } from "class-validator";

import { ShiftChangeDocumentTypeEnum } from "@modules/shift-change-documents/enums/shift-change-document-type.enum";

export class ShiftChangeDocumentFilterDto {
  @IsOptional()
  @IsUUID()
  requesterId?: string;

  @IsOptional()
  @IsUUID()
  shiftChangeRequestId?: string;

  @IsOptional()
  @IsEnum(ShiftChangeDocumentTypeEnum)
  documentType?: ShiftChangeDocumentTypeEnum;
}
