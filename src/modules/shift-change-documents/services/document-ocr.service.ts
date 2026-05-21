import { Injectable } from "@nestjs/common";

@Injectable()
export class DocumentOCRService {
  async extractText(fileUrl: string) {
    return {
      text: "",
    };
  }
}
