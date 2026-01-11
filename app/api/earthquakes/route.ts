/* =========================================================
   FILE: app/api/earthquakes/route.ts
   PROJECT: Open Global Monitor
   PURPOSE: Live global earthquake tracking (USGS)
   SOURCE: https://earthquake.usgs.gov
   ========================================================= */

import { NextResponse } from 'next/server'

/* =========================================================
   CONFIG
   ========================================================= */

export const dynamic = 'force-dynamic'
export const revalidate = 0

const USGS_FEED =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson'

/* =========================================================
   TYPES
   ========================================================= */

interface USGSFeature {
  id: string
  properties: {
    mag: number | null
    place: string
    time: number
    updated: number
    tsunami: number
    sig: number
    url: string
  }
  geometry: {
    type: 'Point'
    coordinates: [number, number, number] // lon, lat, depth
  }
}

interface EarthquakeMarker {
  id: string
  lat: number
  lng: number
  depth: number
  magnitude: number | null
  place: string
  time: number
  updated: number
  significance: number
  tsunami: boolean
  url: string
}

/* =========================================================
   GET HANDLER
   ========================================================= */

export async function GET() {
  try {
    const res = await fetch(USGS_FEED, {
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`USGS error ${res.status}`)
    }

    const json = await res.json()

    if (!json.features || !Array.isArray(json.features)) {
      return NextResponse.json({
        status: 'ok',
        count: 0,
        timestamp: Date.now(),
        data: [],
      })
    }

    const markers: EarthquakeMarker[] = []

    for (const feature of json.features as USGSFeature[]) {
      if (
        !feature.geometry ||
        feature.geometry.type !== 'Point'
      )
        continue

      const [lon, lat, depth] = feature.geometry.coordinates

      markers.push({
        id: feature.id,
        lat,
        lng: lon,
        depth,
        magnitude: feature.properties.mag,
        place: feature.properties.place,
        time: feature.properties.time,
        updated: feature.properties.updated,
        significance: feature.properties.sig,
        tsunami: feature.properties.tsunami === 1,
        url: feature.properties.url,
      })
    }

    return NextResponse.json({
      status: 'ok',
      count: markers.length,
      timestamp: Date.now(),
      data: markers,
    })

  } catch (error) {
    console.error('[EARTHQUAKE API ERROR]', error)

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to load earthquake data',
      },
      { status: 500 }
    )
  }
}

/* =========================================================
   LEGAL & SAFETY:
   - Public scientific data
   - No military inference
   - Real-time natural events only
   ========================================================= */

/* =========================================================
   END OF FILE
   ========================================================= */
