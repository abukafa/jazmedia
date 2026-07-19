import { NextRequest, NextResponse } from "next/server";
import { getDriveClient } from "@/lib/drive";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    // Await params for Next.js 15+ compatibility
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    if (!id) return new NextResponse("Missing id", { status: 400 });

    const drive = getDriveClient();
    
    // Support range requests for video scrubbing and Safari/iOS playback
    const range = req.headers.get("range");
    
    // Get file metadata first
    const metadata = await drive.files.get({
      fileId: id,
      fields: "size, mimeType",
    });
    
    const fileSize = parseInt(metadata.data.size || "0", 10);
    const mimeType = metadata.data.mimeType || "video/mp4";

    let start = 0;
    let end = fileSize - 1;
    let status = 200;
    const headers = new Headers();
    headers.set("Accept-Ranges", "bytes");
    headers.set("Content-Type", mimeType);

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      status = 206;
      headers.set("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      headers.set("Content-Length", (end - start + 1).toString());
    } else {
      headers.set("Content-Length", fileSize.toString());
    }

    const response = await drive.files.get(
      {
        fileId: id,
        alt: "media",
      },
      {
        responseType: "stream",
        headers: range ? { Range: `bytes=${start}-${end}` } : undefined,
      }
    );

    // Convert Node.js readable stream to Web ReadableStream
    const stream = new ReadableStream({
      start(controller) {
        response.data.on('data', (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        response.data.on('end', () => {
          controller.close();
        });
        response.data.on('error', (err: any) => {
          controller.error(err);
        });
      },
      cancel() {
        if (response.data && typeof response.data.destroy === 'function') {
           response.data.destroy();
        }
      }
    });

    return new Response(stream, {
      status,
      headers,
    });
  } catch (error: any) {
    console.error("Drive stream error:", error);
    return new NextResponse("Error fetching video", { status: 500 });
  }
}
