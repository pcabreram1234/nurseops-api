import { Injectable } from "@nestjs/common";

@Injectable()
export class VersionPublishingService {
  async publish(version: any) {
    return {
      published: true,
    };
  }
}
