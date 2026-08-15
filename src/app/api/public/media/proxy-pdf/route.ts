// This file simply delegates to the existing proxy-pdf endpoint
import { GET as proxyPdfGet } from "@/app/api/proxy-pdf/route";

export const GET = proxyPdfGet;
