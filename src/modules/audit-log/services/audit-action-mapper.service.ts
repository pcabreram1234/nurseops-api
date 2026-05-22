import { Injectable } from "@nestjs/common";

@Injectable()
export class AuditActionMapperService {
    map(
        method: string,
    ) {
        switch (method) {
            case "POST":
                return "CREATE";

            case "PATCH":
            case "PUT":
                return "UPDATE";

            case "DELETE":
                return "DELETE";

            default:
                return "UNKNOWN";
        }
    }
}