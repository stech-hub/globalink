/* =========================================================
   FILE: services/openskyAircraft.service.ts
   PROJECT: Open Global Monitor
   PURPOSE: Live global civilian aircraft tracking (REAL)
   DATA SOURCE: OpenSky Network (Public ADS-B)
   LEGALITY: Open, civilian, non-military
   ========================================================= */

/*
  IMPORTANT NOTES:
  - This service fetches REAL aircraft flying right now
  - Uses OpenSky public API
  - Data includes position, altitude, speed, heading, etc.
  - NO fighter jet combat tracking
  - NO missiles
  - NO classified data
*/

export interface AircraftState {
  icao24: string
  callsign: string | null
  origin_country: string
  time_position: number | null
  last_contact: number
  longitude: number
  latitude: number
  baro_altitude: number | null
  on_ground: boolean
  velocity: number | null
  heading: number | null
  vertical_rate: number | null
  geo_altitude: number | null
}

/*
  Raw OpenSky API response type
*/
interface OpenSkyApiResponse {
  time: number
  states: any[] | null
}

/*
  OpenSky endpoint
*/
const OPENSKY_ENDPOINT = 'https://opensky-network.org/api/states/all'

/* =========================================================
   FUNCTION: fetchLiveAircraft
   DESCRIPTION:
   Fetches live aircraft state vectors from OpenSky
   ========================================================= */
export async function fetchLiveAircraft(): Promise<AircraftState[]> {
  try {
    const response = await fetch(OPENSKY_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', // always live
    })

    if (!response.ok) {
      throw new Error(`OpenSky error: ${response.status}`)
    }

    const data: OpenSkyApiResponse = await response.json()

    if (!data.states || data.states.length === 0) {
      return []
    }

    // Transform raw state array into structured objects
    const aircraftList: AircraftState[] = []

    for (const state of data.states) {
      const longitude = state[5]
      const latitude = state[6]

      // Skip aircraft without position
      if (longitude === null || latitude === null) continue

      aircraftList.push({
        icao24: state[0],
        callsign: state[1]?.trim() || null,
        origin_country: state[2],
        time_position: state[3],
        last_contact: state[4],
        longitude,
        latitude,
        baro_altitude: state[7],
        on_ground: state[8],
        velocity: state[9],
        heading: state[10],
        vertical_rate: state[11],
        geo_altitude: state[13],
      })
    }

    return aircraftList

  } catch (error) {
    console.error('[Aircraft Service Error]', error)
    return []
  }
}

/* =========================================================
   FUNCTION: aircraftToMapMarker
   DESCRIPTION:
   Converts aircraft data into map-ready marker object
   ========================================================= */
export function aircraftToMapMarker(aircraft: AircraftState) {
  return {
    id: aircraft.icao24,
    lat: aircraft.latitude,
    lng: aircraft.longitude,
    label: aircraft.callsign || 'Unknown Aircraft',
    speed: aircraft.velocity,
    heading: aircraft.heading,
    altitude: aircraft.geo_altitude,
    country: aircraft.origin_country,
    onGround: aircraft.on_ground,
    raw: aircraft,
  }
}

/* =========================================================
   FUNCTION: normalizeAircraftBatch
   DESCRIPTION:
   Converts many aircraft into marker objects
   ========================================================= */
export function normalizeAircraftBatch(list: AircraftState[]) {
  return list.map(aircraftToMapMarker)
}

/* =========================================================
   END OF FILE
   ========================================================= */
