import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  organizationId!: string;
}
