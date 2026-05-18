import { IsArray, IsNotEmpty, IsUUID } from "class-validator";

export class AssignPermissionsDto {
  @IsArray({ message: "permissionIds must be an array" })
  @IsNotEmpty({ message: "The permissions array can not be empty" })
  @IsUUID("4", {
    each: true,
    message: "Each Permission ID must be an UUID version 4 valid.",
  })
  permissionIds!: string[]; // 🛠️ Eliminado el '!' para seguir el estándar de NestJS
}
