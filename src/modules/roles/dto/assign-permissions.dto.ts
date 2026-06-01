import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class AssignPermissionsDto {
  @IsArray({ message: "permissionIds must be an array" })
  @IsString({ each: true })
  @IsNotEmpty({ message: "The permissions array can not be empty" })
  permissionIds!: string[]; // 🛠️ Eliminado el '!' para seguir el estándar de NestJS
}
