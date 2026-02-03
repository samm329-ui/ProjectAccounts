export const runtime = "nodejs";

import { updateClientPricingRow } from "@/lib/server/sheets";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { clientId, ...payload } = await req.json();
        if (!clientId) return NextResponse.json({ error: "Missing clientId" }, { status: 400 });

        await updateClientPricingRow(clientId, payload);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API Update Pricing Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
