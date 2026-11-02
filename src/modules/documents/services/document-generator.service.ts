import { Injectable, BadRequestException } from "@nestjs/common";
import PDFDocument = require("pdfkit");

export interface SignatureBlock {
  label?: string;
  name?: string;
  role?: string;
}

export interface RenderedDocumentInput {
  title: string;
  header?: Record<string, any> | null;
  body: string;
  footer?: Record<string, any> | null;
  signatureBlocks?: SignatureBlock[] | null;
  documentNumber?: string | null;
  generatedAt: Date;
}

/**
 * Generación de documentos en PDF usando campos dinámicos de la plantilla.
 * La sintaxis de la plantilla es {{campo}} o {{objeto.campo}}.
 */
@Injectable()
export class DocumentGeneratorService {
  /**
   * Reemplaza {{campos}} usando el mapa de valores. Los campos sin valor
   * se dejan como cadena vacía (o se conservan si preserveUnknown está activo).
   */
  renderTemplate(
    template: string,
    values: Record<string, any>,
    preserveUnknown = false,
  ): string {
    return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, key: string) => {
      const value = this.resolvePath(values, key);
      if (value === undefined || value === null) {
        return preserveUnknown ? `{{${key}}}` : "";
      }
      if (value instanceof Date) return this.formatDate(value);
      return String(value);
    });
  }

  /** Genera el PDF completo del documento. */
  async renderPdf(input: RenderedDocumentInput): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: "LETTER", margin: 72 });
        const chunks: Buffer[] = [];
        doc.on("data", (chunk: Buffer) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        const pageWidth = doc.page.width - 144;

        // ── ENCABEZADO ──
        const header = input.header ?? {};
        if (header.institution) {
          doc.fontSize(14).font("Helvetica-Bold").text(String(header.institution), { align: "center" });
        }
        if (header.department) {
          doc.fontSize(10).font("Helvetica").text(String(header.department), { align: "center" });
        }
        if (header.address) {
          doc.fontSize(8).fillColor("#555555").text(String(header.address), { align: "center" });
          doc.fillColor("#000000");
        }
        doc.moveDown(0.5);
        doc.fontSize(16).font("Helvetica-Bold").text(input.title, { align: "center" });
        if (input.documentNumber) {
          doc
            .fontSize(9)
            .font("Helvetica")
            .fillColor("#555555")
            .text(`No. ${input.documentNumber}`, { align: "center" });
          doc.fillColor("#000000");
        }
        doc
          .fontSize(8)
          .fillColor("#777777")
          .text(`Emitido: ${this.formatDateTime(input.generatedAt)}`, { align: "center" });
        doc.fillColor("#000000");
        doc.moveDown();
        doc.moveTo(72, doc.y).lineTo(72 + pageWidth, doc.y).strokeColor("#cccccc").stroke().strokeColor("#000000");
        doc.moveDown();

        // ── CUERPO ──
        doc.fontSize(10).font("Helvetica");
        for (const line of input.body.split("\n")) {
          doc.text(line || " ", { width: pageWidth, align: "justify" });
        }

        // ── BLOQUES DE FIRMA ──
        const blocks = input.signatureBlocks ?? [];
        if (blocks.length > 0) {
          doc.moveDown(2);
          for (const block of blocks) {
            const y = doc.y + 30;
            doc.moveTo(110, y).lineTo(290, y).strokeColor("#333333").stroke().strokeColor("#000000");
            doc
              .fontSize(9)
              .font("Helvetica-Bold")
              .text(block.label || "Firma", 110, y + 5, { width: 180, align: "center" });
            if (block.name) {
              doc.fontSize(8).font("Helvetica").text(block.name, 110, y + 18, { width: 180, align: "center" });
            }
            if (block.role) {
              doc.fontSize(8).font("Helvetica").fillColor("#555555").text(block.role, 110, y + 29, {
                width: 180,
                align: "center",
              });
              doc.fillColor("#000000");
            }
            doc.y = y + 50;
          }
        }

        // ── PIE DE PÁGINA ──
        const footer = input.footer ?? {};
        const footerText =
          footer.text ??
          "Documento generado automáticamente por el sistema NurseOps. Copia fiel del registro emitido.";
        doc
          .moveDown(2)
          .fontSize(7)
          .fillColor("#888888")
          .text(String(footerText), 72, doc.page.height - 90, { width: pageWidth, align: "center" });

        doc.end();
      } catch (error: any) {
        reject(new BadRequestException(`Error al generar el PDF: ${error?.message}`));
      }
    });
  }

  private resolvePath(values: Record<string, any>, key: string): any {
    return key.split(".").reduce((acc: any, part: string) => {
      if (acc === undefined || acc === null) return undefined;
      return acc[part];
    }, values);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  private formatDateTime(date: Date): string {
    return date.toISOString().replace("T", " ").split(".")[0];
  }
}
