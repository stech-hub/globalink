/* =========================================================
   FILE: app/api/aircraft/route.ts
   PROJECT: Open Global Monitor
   PURPOSE: Backend API for live aircraft data
   DATA SOURCE: OpenSky Network (Public ADS-B)
   LEGALITY: Civilian, open, non-military
   ========================================================= */

import { NextResponse } from 'next/server'
import {
  fetchLiveAircraft,
  normalizeAircraftBatch,
} from '@/services/openskyAircraft.service'

/*
  API RESPONSE TYPES
*/
interface ApiSuccessResponse {
  status: 'ok'
  source: 'OpenSky Network'
  count: number
  timestamp: number
  data: any[]
}

interface ApiErrorResponse {
  status: 'error'
  message: string
  timestamp: number
}

/* =========================================================
   METHOD: GET
   ROUTE: /api/aircraft
   DESCRIPTION:
   Returns live aircraft positions worldwide
   ========================================================= */
export async function GET() {
  try {
    // Fetch live aircraft from service
    const aircraft = await fetchLiveAircraft()

    // Normalize for frontend map use
    const markers = normalizeAircraftBatch(aircraft)

    const response: ApiSuccessResponse = {
      status: 'ok',
      source: 'OpenSky Network',
      count: markers.length,
      timestamp: Date.now(),
      data: markers,
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    })

  } catch (error: any) {
    console.error('[API AIRCRAFT ERROR]', error)

    const response: ApiErrorResponse = {
      status: 'error',
      message: 'Failed to fetch live aircraft data',
      timestamp: Date.now(),
    }

    return NextResponse.json(response, {
      status: 500,
    })
  }
}

/* =========================================================
   SECURITY NOTES:
   - No authentication required (public data)
   - Rate-limited by OpenSky
   - No military tracking
   ========================================================= */

/* =========================================================
   END OF FILE
   ========================================================= */
