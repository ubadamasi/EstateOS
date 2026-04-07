/**
 * DEV ONLY — redirects to the login page pre-filled hint.
 * With credentials auth, just log in normally at /login.
 * Disabled in production.
 *
 * Dev credentials (run npm run db:seed first):
 *   chairman@estateos.test / password123
 *   admin@estateos.test    / password123
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  return NextResponse.redirect(new URL("/login", req.url));
}
