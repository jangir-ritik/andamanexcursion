import fs from "fs";
import path from "path";

export interface PDFStorageResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  url?: string;
  error?: string;
}

export class PDFService {
  private static readonly PDF_STORAGE_DIR =
    process.env.PDF_STORAGE_DIR || "./public/tickets";
  private static readonly PDF_BASE_URL = process.env.PDF_BASE_URL || "/tickets";

  /**
   * Store base64 PDF and return access URL
   */
  static async storePDFFromBase64(
    base64Data: string,
    bookingId: string,
    operator: string
  ): Promise<PDFStorageResult> {
    try {
      // Ensure storage directory exists
      await this.ensureStorageDirectory();

      // Generate filename with timestamp to avoid conflicts
      const timestamp = Date.now();
      const fileName = `${operator}_${bookingId}_${timestamp}.pdf`;
      const filePath = path.join(this.PDF_STORAGE_DIR, fileName);

      // Decode base64 and write to file
      const pdfBuffer = Buffer.from(base64Data, "base64");
      await fs.promises.writeFile(filePath, pdfBuffer);

      const publicUrl = `${this.PDF_BASE_URL}/${fileName}`;

      console.log(`✅ PDF stored successfully: ${publicUrl}`);

      return {
        success: true,
        filePath,
        fileName,
        url: publicUrl,
      };
    } catch (error) {
      console.error("❌ PDF storage error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Serve PDF directly without storing (for immediate download)
   */
  static createPDFResponse(base64Data: string, fileName: string) {
    const pdfBuffer = Buffer.from(base64Data, "base64");

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  }

  /**
   * Store PDF in database as base64 (for small PDFs or temporary storage)
   */
  static async storePDFInDatabase(
    base64Data: string,
    bookingId: string,
    operator: string,
    payload: any
  ): Promise<{ success: boolean; documentId?: string; error?: string }> {
    try {
      const result = await payload.create({
        collection: "ferry-tickets",
        data: {
          bookingId,
          operator,
          pdfData: base64Data,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 days
        },
      });

      return {
        success: true,
        documentId: result.id,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Database storage failed",
      };
    }
  }

  /**
   * Ensure storage directory exists
   */
  private static async ensureStorageDirectory(): Promise<void> {
    try {
      await fs.promises.access(this.PDF_STORAGE_DIR);
    } catch {
      await fs.promises.mkdir(this.PDF_STORAGE_DIR, { recursive: true });
      console.log(`📁 Created PDF storage directory: ${this.PDF_STORAGE_DIR}`);
    }
  }

  /**
   * Clean up old PDF files (should be run periodically)
   */
  static async cleanupOldPDFs(maxAgeInDays: number = 30): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.PDF_STORAGE_DIR);
      const cutoffTime = Date.now() - maxAgeInDays * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (!file.endsWith(".pdf")) continue;

        const filePath = path.join(this.PDF_STORAGE_DIR, file);
        const stats = await fs.promises.stat(filePath);

        if (stats.mtimeMs < cutoffTime) {
          await fs.promises.unlink(filePath);
          console.log(`🗑️ Cleaned up old PDF: ${file}`);
        }
      }
    } catch (error) {
      console.error("❌ PDF cleanup error:", error);
    }
  }
}
