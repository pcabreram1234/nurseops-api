import { IsUUID, IsNotEmpty } from "class-validator";

export class WithdrawApplicationDto {
  @IsUUID("4")
  @IsNotEmpty()
  applicationId!: string;
}
