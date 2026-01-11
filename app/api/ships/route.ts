/* =========================================================
   FILE: app/api/ships/route.ts
   PROJECT: Open Global Monitor
   PURPOSE: Backend API for live ship (AIS) data
   ========================================================= */

import { NextResponse } from 'next/server'
import {
  fetchLiveShips,
  normalizeShipBatch,
} from '@/services/aisShip.service'

/* =========================================================
   CONFIG
   ========================================================= */

export const dynamic = 'force-dynamic'
export const revalidate = 0

/* =========================================================
   RATE LIMIT (BASIC – SERVER SIDE)
   ========================================================= */

let lastRequestTime = 0
const MIN_INTERVAL_MS = 8000 // 8 seconds

function rateLimited(): boolean {
  const now = Date.now()
  if (now - lastRequestTime < MIN_INTERVAL_MS) {
    return true
  }
  lastRequestTime = now
  return false
}

/* =========================================================
   GET HANDLER
   ========================================================= */

export async function GET() {
  try {
    /* -----------------------------------------------
       Rate limiting
       ----------------------------------------------- */
    if (rateLimited()) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Too many requests',
        },
        { status: 429 }
      )
    }

    /* -----------------------------------------------
       Fetch ships from AIS provider
       ----------------------------------------------- */
    const ships = await fetchLiveShips()

    if (!ships || ships.length === 0) {
      return NextResponse.json({
        status: 'ok',
        count: 0,
        timestamp: Date.now(),
        data: [],
      })
    }

    /* -----------------------------------------------
       Normalize for frontend
       ----------------------------------------------- */
    const markers = normalizeShipBatch(ships)

    /* -----------------------------------------------
       Response
       ----------------------------------------------- */
    return NextResponse.json({
      status: 'ok',
      count: markers.length,
      timestamp: Date.now(),
      data: markers,
    })

  } catch (error) {
    console.error('[API SHIPS ERROR]', error)

    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/* =========================================================
   SECURITY NOTES:
   - API key never exposed to client
   - Rate-limited
   - No military classification inference
   ========================================================= */

/* =========================================================
   END OF FILE
   ========================================================= */
