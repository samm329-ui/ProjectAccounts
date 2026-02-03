export const runtime = "nodejs";

import { fetchLogs } from "@/lib/server/sheets";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const logs = await fetchLogs();
        return NextResponse.json(logs);
    } catch (error: any) {
        console.error("API Fetch Logs Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST for adding logs can be added here if needed, 
// though often logs are added as side effects of other actions.
export async function POST(req: Request) {
    // Implementation for adding logs if required by client
    return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
