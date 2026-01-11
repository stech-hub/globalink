/* =========================================================
   FILE: components/MapView.tsx
   PROJECT: Open Global Monitor
   PURPOSE: Main interactive map with layer toggles
   ========================================================= */

'use client'

import { useState } from 'react'
import {
  MapContainer,
  TileLayer,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import AircraftLayer from './AircraftLayer'
import ShipLayer from './ShipLayer'
import EarthquakeLayer from './EarthquakeLayer'

/* =========================================================
   COMPONENT
   ========================================================= */
export default function MapView() {
  /* -----------------------------------------------------
     Layer Toggles
     ----------------------------------------------------- */
  const [showAircraft, setShowAircraft] = useState(true)
  const [showShips, setShowShips] = useState(true)
  const [showEarthquakes, setShowEarthquakes] = useState(true)

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {/* ================= CONTROL PANEL ================= */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          background: 'rgba(0,0,0,0.75)',
          padding: 12,
          borderRadius: 8,
          color: '#fff',
          fontSize: 14,
          minWidth: 180,
        }}
      >
        <strong>🌍 Global Layers</strong>
        <hr style={{ opacity: 0.3 }} />

        <label style={{ display: 'block', marginBottom: 6 }}>
          <input
            type="checkbox"
            checked={showAircraft}
            onChange={() =>
              setShowAircraft((v) => !v)
            }
          />{' '}
          ✈️ Aircraft
        </label>

        <label style={{ display: 'block', marginBottom: 6 }}>
          <input
            type="checkbox"
            checked={showShips}
            onChange={() =>
              setShowShips((v) => !v)
            }
          />{' '}
          🚢 Ships
        </label>

        <label style={{ display: 'block' }}>
          <input
            type="checkbox"
            checked={showEarthquakes}
            onChange={() =>
              setShowEarthquakes((v) => !v)
            }
          />{' '}
          🌍 Earthquakes
        </label>
      </div>

      {/* ================= MAP ================= */}
      <MapContainer
        center={[10, 0]}
        zoom={2}
        minZoom={2}
        style={{ width: '100%', height: '100%' }}
        worldCopyJump={true}
      >
        {/* Base Map */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dynamic Layers */}
        {showAircraft && <AircraftLayer />}
        {showShips && <ShipLayer />}
        {showEarthquakes && <EarthquakeLayer />}
      </MapContainer>
    </div>
  )
}

/* =========================================================
   NOTES:
   - FULL production file
   - No demo
   - All layers toggleable
   - Ready for deployment
   ========================================================= */

/* =========================================================
   END OF FILE
   ========================================================= */
