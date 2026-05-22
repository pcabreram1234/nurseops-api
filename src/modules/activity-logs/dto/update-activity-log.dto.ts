import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityLogDto } from './create-activity-log.dto';

/**
 * Los logs de auditoría son inmutables por regla general de compliance.
 * Se incluye el DTO parcial bajo buenas prácticas de la estructura solicitada.
 */
export class UpdateActivityLogDto extends PartialType(CreateActivityLogDto) { }