import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Function to generate an SVG with initials
function generateInitialsSvg(initials: string): string {
  const bgColors = ["#2563eb", "#4f46e5", "#7c3aed", "#0d9488", "#0284c7"];
  const charCodeSum = (initials || "U")
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = bgColors[charCodeSum % bgColors.length];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="50" fill="${color}" />
    <text x="50" y="58" font-size="36" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">${initials}</text>
  </svg>`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } | Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    const relativePath = pathSegments.join("/");

    // 1. Check local storage path in JazAcademy (Laravel)
    const laravelStoragePath = path.resolve(
      process.cwd(),
      "..",
      "laravue-jazmedia",
      "storage",
      "app",
      "public",
      "avatars",
      relativePath
    );

    if (fs.existsSync(laravelStoragePath)) {
      const fileBuffer = fs.readFileSync(laravelStoragePath);
      const ext = path.extname(laravelStoragePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
      };
      const contentType = mimeTypes[ext] || "image/png";

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }

    // 2. If image is not found on disk, generate dynamic SVG avatar with initials
    let initials = "U";
    if (relativePath.includes("teacher/1")) {
      initials = "AA"; // Abdul Aziz / Mr. Abukafa
    } else if (relativePath.includes("teacher/2")) {
      initials = "TS"; // Tia Selpiani / Ms. Tia
    } else if (relativePath.includes("teacher/3")) {
      initials = "GA"; // Ghaida
    } else if (relativePath.includes("teacher/4")) {
      initials = "AR"; // Adam Rabbanie
    } else if (relativePath.includes("teacher/5")) {
      initials = "HA"; // Hijaz Abdullah
    } else {
      const fileName = path.basename(relativePath, path.extname(relativePath));
      initials = fileName.slice(0, 2).toUpperCase();
    }

    const svg = generateInitialsSvg(initials);
    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    const svg = generateInitialsSvg("U");
    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
      },
    });
  }
}
