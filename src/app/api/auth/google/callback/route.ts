import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Code not found" }, { status: 400 });
  }

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
  const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL;

  try {
    // Trocar o código pelo token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    const tokenData: GoogleTokenResponse = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Failed to fetch token:", tokenData);
      return NextResponse.json(
        { error: "Failed to fetch token" },
        { status: 500 },
      );
    }

    // Obter informações do usuário
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    const userInfo: GoogleUserInfo = await userInfoResponse.json();

    if (!userInfoResponse.ok) {
      console.error("Failed to fetch user info:", userInfo);
      return NextResponse.json(
        { error: "Failed to fetch user info" },
        { status: 500 },
      );
    }

    // Verificar se o usuário existe ou criar um novo
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    let username = `${userInfo.given_name}${userInfo.family_name}`;

    const existingUserWithUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username.toLocaleLowerCase(),
          mode: "insensitive",
        },
      },
    });

    if (existingUserWithUsername) {
      username = username + Math.floor(Math.random() * 1001);
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: userInfo.given_name,
          lastname: userInfo.family_name,
          email: userInfo.email,
          avatar: userInfo.picture,
          username,
        },
      });
    }

    // Gerar o JWT
    const accessToken = jwt.sign(
      {
        sub: user.id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      },
    );

    const response = NextResponse.redirect(
      new URL(NEXT_PUBLIC_APP_URL + "/", req.url),
    );

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
