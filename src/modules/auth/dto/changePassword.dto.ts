import { IsUUID, IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
  @IsUUID("4", { message: "The user ID must be a valid UUID." })
  @IsNotEmpty({ message: "The User Id must not be Empty." })
  userId!: string;

  @IsString({ message: "The current password must be a text string." })
  @IsNotEmpty({ message: "A password is required." })
  @MinLength(6, {
    message: "The current password must be at least 6 characters long.",
  })
  currentPassword!: string;

  @IsString({ message: "The new password must be a text string." })
  @IsNotEmpty({ message: "A password is required." })
  @MinLength(6, {
    message: "The nes password must be at least 6 characters long.",
  })
  newPassword!: string;
}
