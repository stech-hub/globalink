/* =========================================================
   FILE: components/EarthquakeLayer.tsx
   PROJECT: Open Global Monitor
   PURPOSE: Render live earthquakes on map
   ========================================================= */

'use client'

import { useEffect, useState, useRef } from 'react'
import { CircleMarker, Popup, LayerGroup } from 'react-leaflet'

/* =========================================================
   TYPES
   ========================================================= */
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

interface ApiResponse {
  status: string
  count: number
  timestamp: number
  data: EarthquakeMarker[]
}

/* =========================================================
   HELPERS
   ========================================================= */
function getColor(mag: number | null) {
  if (!mag) return '#999'
  if (mag >= 6) return '#d73027'
  if (mag >= 5) return '#fc8d59'
  if (mag >= 4) return '#fee08b'
  return '#91cf60'
}

function getRadius(mag: number | null) {
  if (!mag) return 4
  return Math.max(4, mag * 3)
}

/* =========================================================
   COMPONENT
   ========================================================= */
export default function EarthquakeLayer() {
  const [quakes, setQuakes] = useState<EarthquakeMarker[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const loadQuakes = async () => {
    try {
      const res = await fetch('/api/earthquakes', {
        cache: 'no-store',
      })

      if (!res.ok) throw new Error('Earthquake fetch failed')

      const json: ApiResponse = await res.json()
      if (json.status === 'ok') {
        setQuakes(json.data)
      }
    } catch (err) {
      console.error('[EarthquakeLayer]', err)
    }
  }

  useEffect(() => {
    loadQuakes()

    intervalRef.current = setInterval(() => {
      loadQuakes()
    }, 60000) // every 1 minute

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <LayerGroup>
      {quakes.map((q) => (
        <CircleMarker
          key={q.id}
          center={[q.lat, q.lng]}
          radius={getRadius(q.magnitude)}
          pathOptions={{
            color: getColor(q.magnitude),
            fillOpacity: 0.7,
          }}
        >
          <Popup>
            <div style={{ minWidth: 220 }}>
              <strong>🌍 Earthquake</strong>
              <br />
              <b>Location:</b> {q.place}
              <br />
              <b>Magnitude:</b> {q.magnitude ?? 'N/A'}
              <br />
              <b>Depth:</b> {q.depth} km
              <br />
              <b>Tsunami:</b> {q.tsunami ? 'Yes ⚠️' : 'No'}
              <br />
              <small>
                Time:{' '}
                {new Date(q.time).toLocaleString()}
              </small>
              <br />
              <a href={q.url} target="_blank">
                USGS details
              </a>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </LayerGroup>
  )
}

/* =========================================================
   END OF FILE
   ========================================================= */
