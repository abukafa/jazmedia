import { redirect } from "next/navigation";

export async function GET() {
  const url = process.env.INSTAGRAM_EMBED_URL;
  if (url) {
    redirect(url);
  } else {
    redirect("/profile?error=missing_url");
  }
}
