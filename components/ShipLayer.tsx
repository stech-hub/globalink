/* =========================================================
   FILE: components/ShipLayer.tsx
   PROJECT: Open Global Monitor
   PURPOSE: Render live ships (AIS) on Leaflet map
   ========================================================= */

'use client'

import { useEffect, useState, useRef } from 'react'
import { Marker, Popup, LayerGroup } from 'react-leaflet'
import L from 'leaflet'

/* =========================================================
   TYPES
   ========================================================= */
interface ShipMarker {
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

interface ApiResponse {
  status: string
  count: number
  timestamp: number
  data: ShipMarker[]
}

/* =========================================================
   ICON CONFIGURATION
   ========================================================= */
const shipIcon = new L.DivIcon({
  className: 'ship-icon',
  html: '🚢',
  iconSize: [20, 20],
})

/* =========================================================
   COMPONENT
   ========================================================= */
export default function ShipLayer() {
  const [ships, setShips] = useState<ShipMarker[]>([])
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  /* =====================================================
     FETCH LIVE SHIPS
     ===================================================== */
  const loadShips = async () => {
    try {
      const res = await fetch('/api/ships', {
        cache: 'no-store',
      })

      if (!res.ok) {
        throw new Error('Ship fetch failed')
      }

      const json: ApiResponse = await res.json()

      if (json.status === 'ok') {
        setShips(json.data)
      }
    } catch (err) {
      console.error('[ShipLayer]', err)
    } finally {
      setLoading(false)
    }
  }

  /* =====================================================
     AUTO REFRESH
     ===================================================== */
  useEffect(() => {
    loadShips()

    intervalRef.current = setInterval(() => {
      loadShips()
    }, 20000) // every 20 seconds (AIS-friendly)

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

      {ships.map((ship) => (
        <Marker
          key={ship.id}
          position={[ship.lat, ship.lng]}
          icon={shipIcon}
        >
          <Popup>
            <div style={{ minWidth: 220 }}>
              <strong>🚢 Vessel</strong>
              <br />
              <b>Name:</b> {ship.name}
              <br />
              <b>Type:</b> {ship.type}
              <br />
              <b>Status:</b> {ship.status}
              <br />
              <b>Speed:</b>{' '}
              {ship.speed ? `${ship.speed.toFixed(1)} kn` : 'N/A'}
              <br />
              <b>Course:</b>{' '}
              {ship.course ? `${ship.course.toFixed(0)}°` : 'N/A'}
              <br />
              <b>Heading:</b>{' '}
              {ship.heading ? `${ship.heading.toFixed(0)}°` : 'N/A'}
              <br />
              <small>
                Updated:{' '}
                {new Date(ship.timestamp).toLocaleTimeString()}
              </small>
            </div>
          </Popup>
        </Marker>
      ))}
    </LayerGroup>
  )
}

/* =========================================================
   PERFORMANCE NOTES:
   - LayerGroup batching
   - Server-side rate limited
   - Optimized refresh interval
   ========================================================= */

/* =========================================================
   END OF FILE
   ========================================================= */
