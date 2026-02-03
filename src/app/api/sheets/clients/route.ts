export const runtime = "nodejs";

import { fetchClients, addClientRow } from "@/lib/server/sheets";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const clients = await fetchClients();
        return NextResponse.json(clients);
    } catch (error: any) {
        console.error("API Fetch Clients Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        await addClientRow(body);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API Add Client Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
