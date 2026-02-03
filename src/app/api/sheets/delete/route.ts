export const runtime = "nodejs";

import { deleteClientRow } from "@/lib/server/sheets";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { clientId, hardDelete } = await req.json();
        if (!clientId) return NextResponse.json({ error: "Missing clientId" }, { status: 400 });

        await deleteClientRow(clientId, hardDelete);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API Delete Client Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
