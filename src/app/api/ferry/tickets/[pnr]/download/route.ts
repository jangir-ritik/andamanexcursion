import { NextRequest, NextResponse } from "next/server";
import { PDFService } from "@/services/pdfService";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pnr: string }> }
) {
  try {
    const { pnr } = await params;

    if (!pnr) {
      return NextResponse.json({ error: "PNR is required" }, { status: 400 });
    }

    console.log(`📄 PDF Download request for PNR: ${pnr}`);

    // Check if PDF exists in storage directory
    const storageDir = process.env.PDF_STORAGE_DIR || "./public/tickets";

    // Look for PDF files matching the PNR pattern
    try {
      const files = await fs.promises.readdir(storageDir);
      const pdfFile = files.find(
        (file) => file.includes(pnr) && file.endsWith(".pdf")
      );

      if (!pdfFile) {
        console.log(`❌ PDF not found for PNR: ${pnr}`);
        return NextResponse.json(
          { error: "Ticket PDF not found" },
          { status: 404 }
        );
      }

      const pdfPath = path.join(storageDir, pdfFile);
      const pdfBuffer = await fs.promises.readFile(pdfPath);

      console.log(`✅ PDF found and serving: ${pdfFile}`);

      // Return PDF with appropriate headers
      return new Response(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="Ferry_Ticket_${pnr}.pdf"`,
          "Content-Length": pdfBuffer.length.toString(),
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
          Expires: "0",
          Pragma: "no-cache",
        },
      });
    } catch (storageError) {
      console.error("❌ Error accessing PDF storage:", storageError);

      // If file storage fails, try database lookup as fallback
      try {
        // This would require implementing database PDF storage
        // For now, return appropriate error
        return NextResponse.json(
          {
            error: "PDF temporarily unavailable",
            message: "Please contact support with your PNR for assistance",
          },
          { status: 503 }
        );
      } catch (dbError) {
        console.error("❌ Database PDF lookup failed:", dbError);
        return NextResponse.json(
          { error: "PDF service unavailable" },
          { status: 503 }
        );
      }
    }
  } catch (error) {
    console.error("❌ PDF download error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: Add a POST endpoint to regenerate PDF from booking data
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pnr: string }> }
) {
  try {
    const { pnr } = await params;
    const body = await request.json();

    if (!pnr) {
      return NextResponse.json({ error: "PNR is required" }, { status: 400 });
    }

    const { operator, bookingId } = body;

    if (!operator || !bookingId) {
      return NextResponse.json(
        { error: "Operator and booking ID are required" },
        { status: 400 }
      );
    }

    console.log(
      `🔄 PDF regeneration request for PNR: ${pnr}, Operator: ${operator}`
    );

    // Attempt to regenerate PDF from the original operator
    let pdfBase64: string | undefined;
    let error: string | undefined;

    switch (operator) {
      case "makruzz":
        const { MakruzzService } = await import(
          "@/services/ferryServices/makruzzService"
        );
        const makruzzResult = await MakruzzService.getTicketPDF(bookingId);
        if (makruzzResult.success) {
          pdfBase64 = makruzzResult.pdfBase64;
        } else {
          error = makruzzResult.error;
        }
        break;

      case "greenocean":
        // Green Ocean PDFs are provided at booking time
        error = "Green Ocean PDFs are not regenerable after booking";
        break;

      case "sealink":
        // Sealink may not provide PDF tickets
        error = "Sealink PDFs are not available through API";
        break;

      default:
        error = "Unsupported operator";
    }

    if (pdfBase64) {
      // Store the regenerated PDF
      const storageResult = await PDFService.storePDFFromBase64(
        pdfBase64,
        pnr,
        operator
      );

      if (storageResult.success) {
        // Return the PDF directly
        const pdfBuffer = Buffer.from(pdfBase64, "base64");
        return new Response(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="Ferry_Ticket_${pnr}.pdf"`,
            "Content-Length": pdfBuffer.length.toString(),
          },
        });
      } else {
        return NextResponse.json(
          { error: "Failed to store regenerated PDF" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: error || "Failed to regenerate PDF" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("❌ PDF regeneration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
