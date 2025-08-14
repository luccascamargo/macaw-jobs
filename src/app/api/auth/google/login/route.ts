import { NextResponse } from "next/server";

export async function GET() {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

  const scope = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID!,
    redirect_uri: GOOGLE_REDIRECT_URI!,
    scope,
    response_type: "code",
  });

  const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

  return NextResponse.redirect(googleLoginUrl);
}
