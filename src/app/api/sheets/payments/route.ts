export const runtime = "nodejs";

import { fetchPayments, addPaymentRow } from "@/lib/server/sheets";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const payments = await fetchPayments();
        return NextResponse.json(payments);
    } catch (error: any) {
        console.error("API Fetch Payments Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        await addPaymentRow(body);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API Add Payment Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
