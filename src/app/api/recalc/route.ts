/**
 * API Endpoint: POST /api/recalc
 * 
 * Triggers canonical recalculation of all client derived fields.
 * Should be called after any mutation that affects calculations.
 */

import { recalculateAll } from '@/lib/recalc';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const actor = body.actor || 'api';

        console.log(`📊 Recalc triggered by ${actor}`);

        const result = await recalculateAll(actor);

        if (!result.success) {
            return NextResponse.json(
                {
                    error: 'Recalculation failed',
                    details: result.errors
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            clientsUpdated: result.clientsUpdated,
            timestamp: result.timestamp,
            timeTaken: result.timeTaken
        });

    } catch (error: any) {
        console.error('Recalc API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Use POST to trigger recalculation',
        usage: 'POST /api/recalc with optional { actor: "username" }'
    });
}
