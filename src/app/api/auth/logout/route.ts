import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/cookies";

export async function POST() {
  const response = NextResponse.json({ message: "Tizimdan chiqdingiz" }, { status: 200 });
  clearAuthCookies(response);
  return response;
}
