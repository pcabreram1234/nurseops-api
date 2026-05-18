import { IsUUID, IsNotEmpty } from "class-validator";

export class LogOutDto {
  @IsUUID("4", { message: "The user ID must be a valid UUID." })
  @IsNotEmpty({ message: "The User Id must not be Empty." })
  userId!: string;
}
