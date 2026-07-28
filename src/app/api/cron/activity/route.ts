/**
 * Cron job to keep the application active
 * Runs every 30 minutes
 */
import { NextResponse } from "next/server";

export async function GET() {
  // This cron job keeps the serverless function warm
  // It also syncs any pending data
  
  const timestamp = new Date().toISOString();
  
  return NextResponse.json({
    ok: true,
    message: "Activity ping",
    timestamp,
  });
}

// Vercel cron configuration
export const dynamic = "force-dynamic";
export const maxDuration = 10;
