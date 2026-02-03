export const runtime = "nodejs";

import { getSheets, spreadsheetId } from "@/lib/server/sheets";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const entry = await req.json();
        const sheets = await getSheets();

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: "TeamLedger!A:H",
            valueInputOption: "RAW",
            requestBody: {
                values: [[
                    `ledger_${Date.now()}`,
                    entry.memberId,
                    entry.clientId,
                    entry.date,
                    entry.amount,
                    entry.type,
                    entry.reason,
                    entry.by
                ]],
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API Add Ledger Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
