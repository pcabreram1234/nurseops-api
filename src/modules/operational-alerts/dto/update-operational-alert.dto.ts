import { PartialType } from '@nestjs/mapped-types';
import { CreateOperationalAlertDto } from './create-operational-alert.dto';

export class UpdateOperationalAlertDto extends PartialType(CreateOperationalAlertDto) { }