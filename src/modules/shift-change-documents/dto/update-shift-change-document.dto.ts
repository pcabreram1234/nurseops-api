import { PartialType } from "@nestjs/mapped-types";

import { CreateShiftChangeDocumentDto } from "./create-shift-change-document.dto";

export class UpdateShiftChangeDocumentDto extends PartialType(
  CreateShiftChangeDocumentDto,
) {}
