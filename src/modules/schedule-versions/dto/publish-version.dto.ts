import { IsBoolean } from "class-validator";

export class PublishVersionDto {
  @IsBoolean()
  publish!: boolean;
}
