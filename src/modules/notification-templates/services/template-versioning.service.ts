import { Injectable } from "@nestjs/common";

@Injectable()
export class TemplateVersioningService {
    async createVersion(
        payload: any,
    ) {
        return true;
    }
}