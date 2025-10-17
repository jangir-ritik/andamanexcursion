import { NextResponse } from "next/server";
import { BookingPDFData } from "@/components/pdf/types/booking.types";
import { logo_image_base64 } from "@/components/pdf/utils/logo_image_base64";

export interface PDFStorageResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  url?: string;
  error?: string;
}

export interface PDFGenerationResult {
  success: boolean;
  pdfBuffer?: Buffer;
  fileName?: string;
  error?: string;
}

export class PDFService {
  private static readonly PDF_STORAGE_DIR =
    process.env.PDF_STORAGE_DIR || "./public/tickets";
  private static readonly PDF_BASE_URL = process.env.PDF_BASE_URL || "/tickets";

  // Logo URL (can be base64 or public URL)
  private static logoUrl: string = logo_image_base64;

  /**
   * Set logo URL (call this before generating PDFs)
   */
  static setLogo(url: string) {
    this.logoUrl = url;
  }

  /**
   * Validate if string is a valid base64 image
   */
  private static isBase64Image(str: string): boolean {
    if (!str) return false;
    // Check if it's a data URL
    if (str.startsWith("data:image/")) return true;
    // Check if it's base64 encoded
    const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
    return base64Regex.test(str.replace(/\s/g, ""));
  }

  /**
   * Convert base64 to data URL if needed
   */
  private static ensureDataURL(imageStr: string): string {
    if (!imageStr) return "";

    // Already a data URL
    if (imageStr.startsWith("data:")) return imageStr;

    // If it's a regular URL, return as is
    if (imageStr.startsWith("http://") || imageStr.startsWith("https://")) {
      return imageStr;
    }

    // If it's base64 without data URL prefix, add it
    if (this.isBase64Image(imageStr)) {
      // Default to PNG if no format specified
      return `data:image/png;base64,${imageStr}`;
    }

    return imageStr;
  }

  /**
   * Generate professional booking PDF using React + react-pdf
   */
  static async generateBookingPDF(
    data: BookingPDFData,
    logoUrl?: string
  ): Promise<PDFGenerationResult> {
    try {
      const logo = this.ensureDataURL(logoUrl || this.logoUrl);

      console.log("📄 Generating PDF for booking:", data.bookingId);

      // Import react-pdf rendering utilities dynamically (server-side only)
      const ReactPDF = await import("@react-pdf/renderer");
      const { default: BookingTicketPDF } = await import(
        "@/components/pdf/BookingTicketPDF"
      );
      const React = await import("react");

      // 1. Create React element
      const pdfDocument = React.createElement(BookingTicketPDF, {
        data,
        logoUrl: logo,
      });

      // 2. Render PDF to buffer
      const pdfBuffer = await ReactPDF.renderToBuffer(pdfDocument as any);

      const fileName = `AndamanExcursion_${
        data.confirmationNumber
      }_${Date.now()}.pdf`;

      console.log("✅ PDF generated successfully:", fileName);

      return {
        success: true,
        pdfBuffer: Buffer.from(pdfBuffer),
        fileName,
      };
    } catch (error) {
      console.error("❌ PDF generation error:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Store PDF buffer to file system and return public URL
   */
  static async storePDFToFileSystem(
    pdfBuffer: Buffer,
    bookingId: string,
    operator: string = "booking"
  ): Promise<PDFStorageResult> {
    try {
      const fs = await import("fs");
      const path = await import("path");

      console.log(`📁 PDF Storage Dir: ${this.PDF_STORAGE_DIR}`);
      console.log(`📁 PDF Base URL: ${this.PDF_BASE_URL}`);

      // Ensure directory exists
      await this.ensureStorageDirectory();

      const timestamp = Date.now();
      const fileName = `${operator}_${bookingId}_${timestamp}.pdf`;
      const filePath = path.join(this.PDF_STORAGE_DIR, fileName);

      console.log(`📝 Writing PDF to: ${filePath}`);
      console.log(`📝 File name: ${fileName}`);
      console.log(`📝 Buffer size: ${pdfBuffer.length} bytes`);

      // Write PDF to file
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
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown",
        code: (error as any)?.code,
        errno: (error as any)?.errno,
        syscall: (error as any)?.syscall,
        path: (error as any)?.path,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Store PDF from base64 string to file system
   */
  static async storePDFFromBase64(
    base64Data: string,
    bookingId: string,
    operator: string = "booking"
  ): Promise<PDFStorageResult> {
    try {
      console.log(`📄 PDFService: Processing base64 PDF for ${operator}/${bookingId}`);
      
      // Validate input
      if (!base64Data) {
        console.error("❌ Empty base64 data provided");
        return {
          success: false,
          error: "Empty base64 data",
        };
      }

      if (typeof base64Data !== "string") {
        console.error("❌ base64Data is not a string:", typeof base64Data);
        return {
          success: false,
          error: `Invalid base64 data type: ${typeof base64Data}`,
        };
      }

      console.log(`📄 Base64 data length: ${base64Data.length} characters`);

      // Convert base64 to buffer
      const pdfBuffer = Buffer.from(base64Data, "base64");
      console.log(`📄 Converted to buffer: ${pdfBuffer.length} bytes`);

      if (pdfBuffer.length === 0) {
        console.error("❌ Resulting buffer is empty");
        return {
          success: false,
          error: "Empty PDF buffer after base64 conversion",
        };
      }

      // Store using existing method
      const result = await this.storePDFToFileSystem(pdfBuffer, bookingId, operator);
      
      if (result.success) {
        console.log(`✅ PDF stored successfully: ${result.url}`);
      } else {
        console.error(`❌ PDF storage failed: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      console.error("❌ Base64 PDF storage error:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Store PDF in database as base64
   */
  static async storePDFInDatabase(
    pdfBuffer: Buffer,
    bookingId: string,
    operator: string,
    payload: any
  ): Promise<{ success: boolean; documentId?: string; error?: string }> {
    try {
      const base64Data = pdfBuffer.toString("base64");

      const result = await payload.create({
        collection: "ferry-tickets",
        data: {
          bookingId,
          operator,
          pdfData: base64Data,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      });

      console.log(`✅ PDF stored in database: ${result.id}`);
      return { success: true, documentId: result.id };
    } catch (error) {
      console.error("❌ Database storage error:", error);
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
      const fs = await import("fs");
      await fs.promises.access(this.PDF_STORAGE_DIR);
    } catch {
      const fs = await import("fs");
      await fs.promises.mkdir(this.PDF_STORAGE_DIR, { recursive: true });
      console.log(`📁 Created PDF storage directory: ${this.PDF_STORAGE_DIR}`);
    }
  }

  /**
   * Clean up old PDF files (should be run periodically via cron)
   */
  static async cleanupOldPDFs(maxAgeInDays: number = 30): Promise<void> {
    try {
      const fs = await import("fs");
      const path = await import("path");

      const files = await fs.promises.readdir(this.PDF_STORAGE_DIR);
      const cutoffTime = Date.now() - maxAgeInDays * 24 * 60 * 60 * 1000;

      let deletedCount = 0;

      for (const file of files) {
        if (!file.endsWith(".pdf")) continue;

        const filePath = path.join(this.PDF_STORAGE_DIR, file);
        const stats = await fs.promises.stat(filePath);

        if (stats.mtimeMs < cutoffTime) {
          await fs.promises.unlink(filePath);
          deletedCount++;
        }
      }

      console.log(`🗑️ Cleaned up ${deletedCount} old PDF files`);
    } catch (error) {
      console.error("❌ PDF cleanup error:", error);
    }
  }

  /**
   * Generate PDF and return as HTTP response (for immediate download)
   */
  static createPDFResponse(pdfBuffer: Buffer, fileName: string) {
    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(pdfBuffer);

    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    });
  }

  /**
   * Generate PDF stream (useful for previewing in browser)
   */
  static async generatePDFStream(
    data: BookingPDFData,
    logoUrl?: string
  ): Promise<NodeJS.ReadableStream> {
    const logo = this.ensureDataURL(logoUrl || this.logoUrl);

    const ReactPDF = await import("@react-pdf/renderer");
    const { default: BookingTicketPDF } = await import(
      "@/components/pdf/BookingTicketPDF"
    );
    const React = await import("react");

    const pdfDocument = React.createElement(BookingTicketPDF, {
      data,
      logoUrl: logo,
    });

    return ReactPDF.renderToStream(pdfDocument as any);
  }
}

export default PDFService;
