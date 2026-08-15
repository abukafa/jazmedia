// This file simply delegates to the existing proxy-pdf endpoint
import { GET as proxyPdfGet } from "../../../../../proxy-pdf/route";

export const GET = proxyPdfGet;
