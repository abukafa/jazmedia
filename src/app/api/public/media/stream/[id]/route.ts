// This file simply delegates to the existing drive stream endpoint
import { GET as driveStreamGet } from "@/app/api/drive/stream/[id]/route";

export const GET = driveStreamGet;
