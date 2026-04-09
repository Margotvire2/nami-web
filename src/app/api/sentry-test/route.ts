import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    throw new Error("Sentry SERVER test — " + new Date().toISOString());
  } catch (e) {
    Sentry.captureException(e);
    await Sentry.flush(2000);
    return NextResponse.json({ sent: true, dsn: !!process.env.NEXT_PUBLIC_SENTRY_DSN });
  }
}
