import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const refCookies = await cookies();
  refCookies.delete("accessToken");
  return NextResponse.json({ message: "Logged out successfully" });
}
