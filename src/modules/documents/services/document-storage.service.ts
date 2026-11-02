import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Almacenamiento seguro y escalable de documentos generados.
 * Implementación local bajo ./storage/documents (aislada por organización).
 * Diseñada para ser sustituible por S3 u object storage sin cambiar la API.
 */
@Injectable()
export class DocumentStorageService {
  private readonly logger = new Logger(DocumentStorageService.name);
  private readonly rootDir = path.resolve(process.cwd(), "storage", "documents");

  /**
   * Guarda el buffer del documento y devuelve metadatos de almacenamiento.
   * La ruta SIEMPRE queda dentro de storage/documents (protección path traversal).
   */
  async save(
    organizationId: string,
    extension: string,
    content: Buffer,
  ): Promise<{ filePath: string; sizeBytes: number }> {
    const safeExt = extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
    const datePart = new Date().toISOString().split("T")[0];
    const fileName = `${datePart}-${randomUUID()}.${safeExt}`;
    const relativePath = path.join(organizationId, fileName);
    const absolutePath = this.resolveSafe(relativePath);

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, content);

    return { filePath: relativePath, sizeBytes: content.length };
  }

  /** Lee un documento almacenado. */
  async read(filePath: string): Promise<Buffer> {
    const absolutePath = this.resolveSafe(filePath);
    try {
      return await fs.readFile(absolutePath);
    } catch {
      throw new BadRequestException("El archivo del documento no está disponible");
    }
  }

  /** Elimina un documento almacenado (usado por reglas de retención). */
  async delete(filePath: string): Promise<void> {
    const absolutePath = this.resolveSafe(filePath);
    try {
      await fs.unlink(absolutePath);
    } catch {
      this.logger.warn(`Archivo no encontrado al eliminar: ${filePath}`);
    }
  }

  /** Resuelve y valida que la ruta quede dentro del directorio raíz. */
  private resolveSafe(relativePath: string): string {
    const absolutePath = path.resolve(this.rootDir, relativePath);
    if (!absolutePath.startsWith(this.rootDir)) {
      throw new BadRequestException("Ruta de almacenamiento inválida");
    }
    return absolutePath;
  }
}
