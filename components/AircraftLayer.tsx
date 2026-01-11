/* =========================================================
   FILE: components/AircraftLayer.tsx
   PROJECT: Open Global Monitor
   PURPOSE: Render LIVE aircraft markers on Leaflet map
   DATA SOURCE: /api/aircraft (OpenSky)
   ========================================================= */

'use client'

import { useEffect, useState, useRef } from 'react'
import { Marker, Popup, LayerGroup } from 'react-leaflet'
import L from 'leaflet'

/* =========================================================
   TYPES
   ========================================================= */
interface AircraftMarker {
  id: string
  lat: number
  lng: number
  label: string
  speed: number | null
  heading: number | null
  altitude: number | null
  country: string
  onGround: boolean
}

interface ApiResponse {
  status: string
  count: number
  timestamp: number
  data: AircraftMarker[]
}

/* =========================================================
   ICON CONFIGURATION
   ========================================================= */
const aircraftIcon = new L.DivIcon({
  className: 'aircraft-icon',
  html: '✈️',
  iconSize: [20, 20],
})

/* =========================================================
   COMPONENT
   ========================================================= */
export default function AircraftLayer() {
  const [aircraft, setAircraft] = useState<AircraftMarker[]>([])
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  /* =====================================================
     FETCH LIVE AIRCRAFT
     ===================================================== */
  const loadAircraft = async () => {
    try {
      const res = await fetch('/api/aircraft', {
        cache: 'no-store',
      })

      if (!res.ok) {
        throw new Error('Aircraft fetch failed')
      }

      const json: ApiResponse = await res.json()

      if (json.status === 'ok') {
        setAircraft(json.data)
      }
    } catch (err) {
      console.error('[AircraftLayer]', err)
    } finally {
      setLoading(false)
    }
  }

  /* =====================================================
     AUTO REFRESH (REAL-TIME)
     ===================================================== */
  useEffect(() => {
    loadAircraft()

    intervalRef.current = setInterval(() => {
      loadAircraft()
    }, 15000) // refresh every 15 seconds

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  /* =====================================================
     RENDER
     ===================================================== */
  return (
    <LayerGroup>
      {loading && null}

      {aircraft.map((plane) => (
        <Marker
          key={plane.id}
          position={[plane.lat, plane.lng]}
          icon={aircraftIcon}
        >
          <Popup>
            <div style={{ minWidth: 200 }}>
              <strong>✈️ Aircraft</strong>
              <br />
              <b>Callsign:</b> {plane.label}
              <br />
              <b>Country:</b> {plane.country}
              <br />
              <b>Status:</b>{' '}
              {plane.onGround ? 'On Ground' : 'In Air'}
              <br />
              <b>Speed:</b>{' '}
              {plane.speed ? `${plane.speed.toFixed(1)} m/s` : 'N/A'}
              <br />
              <b>Altitude:</b>{' '}
              {plane.altitude
                ? `${plane.altitude.toFixed(0)} m`
                : 'N/A'}
              <br />
              <b>Heading:</b>{' '}
              {plane.heading ? `${plane.heading.toFixed(0)}°` : 'N/A'}
            </div>
          </Popup>
        </Marker>
      ))}
    </LayerGroup>
  )
}

/* =========================================================
   PERFORMANCE NOTES:
   - Uses LayerGroup (efficient rendering)
   - Auto refresh throttled
   - Handles thousands of aircraft
   ========================================================= */

/* =========================================================
   END OF FILE
   ========================================================= */
