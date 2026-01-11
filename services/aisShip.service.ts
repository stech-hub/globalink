/* =========================================================
   FILE: services/aisShip.service.ts
   PROJECT: Open Global Monitor
   PURPOSE: Live global ship tracking (AIS)
   DATA SOURCE: AIS Provider (MarineTraffic / AISHub / FleetMon)
   LEGALITY: Civilian maritime tracking
   ========================================================= */

/*
  ⚠️ IMPORTANT:
  - AIS data ALWAYS requires an API key
  - Do NOT trust any site claiming "free unlimited AIS"
  - This service is written to production standards
*/

/* =========================================================
   TYPES
   ========================================================= */

export interface ShipState {
  mmsi: string
  name: string
  type: string
  latitude: number
  longitude: number
  speed: number | null
  course: number | null
  heading: number | null
  status: string
  lastUpdate: number
}

/*
  Normalized ship marker (map-ready)
*/
export interface ShipMarker {
  id: string
  lat: number
  lng: number
  name: string
  type: string
  speed: number | null
  course: number | null
  heading: number | null
  status: string
  timestamp: number
}

/* =========================================================
   CONFIGURATION
   ========================================================= */

/*
  Example provider: MarineTraffic
  Docs: https://www.marinetraffic.com/en/ais-api-services
*/
const AIS_API_URL =
  'https://services.marinetraffic.com/api/exportvessels/v:8'

const AIS_API_KEY = process.env.AIS_API_KEY // REQUIRED

/* =========================================================
   FUNCTION: fetchLiveShips
   ========================================================= */
export async function fetchLiveShips(): Promise<ShipState[]> {
  if (!AIS_API_KEY) {
    console.warn('[AIS] Missing API key')
    return []
  }

  try {
    const url =
      `${AIS_API_URL}/${AIS_API_KEY}` +
      `?protocol=jsono` +
      `&timespan=10` // last 10 minutes

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`AIS error: ${res.status}`)
    }

    const data = await res.json()

    if (!Array.isArray(data)) return []

    const ships: ShipState[] = []

    for (const item of data) {
      if (!item.LAT || !item.LON || !item.MMSI) continue

      ships.push({
        mmsi: String(item.MMSI),
        name: item.SHIPNAME || 'Unknown Vessel',
        type: item.SHIPTYPE || 'Unknown',
        latitude: Number(item.LAT),
        longitude: Number(item.LON),
        speed: item.SPEED ? Number(item.SPEED) : null,
        course: item.COURSE ? Number(item.COURSE) : null,
        heading: item.HEADING ? Number(item.HEADING) : null,
        status: item.STATUS || 'Unknown',
        lastUpdate: Date.now(),
      })
    }

    return ships

  } catch (error) {
    console.error('[AIS SERVICE ERROR]', error)
    return []
  }
}

/* =========================================================
   NORMALIZATION
   ========================================================= */

export function shipToMarker(ship: ShipState): ShipMarker {
  return {
    id: ship.mmsi,
    lat: ship.latitude,
    lng: ship.longitude,
    name: ship.name,
    type: ship.type,
    speed: ship.speed,
    course: ship.course,
    heading: ship.heading,
    status: ship.status,
    timestamp: ship.lastUpdate,
  }
}

export function normalizeShipBatch(list: ShipState[]): ShipMarker[] {
  return list.map(shipToMarker)
}

/* =========================================================
   SECURITY & LEGAL NOTES:
   - Civilian AIS only
   - No military vessels filtering bypass
   - Provider terms must be respected
   ========================================================= */

/* =========================================================
   END OF FILE
   ========================================================= */
