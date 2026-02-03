export const runtime = "nodejs";

import { fetchTeamLedger } from "@/lib/server/sheets";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const ledger = await fetchTeamLedger();
        return NextResponse.json(ledger);
    } catch (error: any) {
        console.error("API Fetch Ledger Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
// POST for ledger entries can be added here
