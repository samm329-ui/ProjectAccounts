export const runtime = "nodejs";

import { getSheets, spreadsheetId } from "@/lib/server/sheets";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { clientId, clientName, contact, businessType } = await req.json();
        if (!clientId) return NextResponse.json({ error: "Missing clientId" }, { status: 400 });

        const sheets = await getSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "Clients!A:A",
        });
        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row => row[0] === clientId) + 1;

        if (rowIndex <= 0) return NextResponse.json({ error: "Client not found" }, { status: 404 });

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Clients!B${rowIndex}:D${rowIndex}`,
            valueInputOption: "RAW",
            requestBody: {
                values: [[clientName, contact, businessType]],
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API Update Details Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
