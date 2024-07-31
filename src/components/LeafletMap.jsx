import React, { useEffect, Suspense, lazy } from 'react'

import L from 'leaflet'
import { MapContainer, useMap } from 'react-leaflet'

import pin from '../assets/img/pin-verde.svg'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.fullscreen'
import 'leaflet.fullscreen/Control.FullScreen.css'
import 'leaflet-easyprint'
import '../helpers/leaflet-plugins/leaflet.navbar.css'

const MapControls = lazy(() => import('./MapControls'))

const icon = new L.Icon({
    iconUrl: pin,
    iconRetinaUrl: pin,
    iconSize: new L.Point(20, 40)
})

function DetalheColetaMap({ latitude, longitude, hcf }) {
    const map = useMap()

    useEffect(() => {
        if (latitude && longitude) {
            const latLng = new L.LatLng(latitude, longitude)
            const markerIcon = icon

            const popupContent = `<div style="font-size: 14px; font-weight: bold; text-align: center;">HCF: ${hcf}</div>`

            L.marker(latLng, { icon: markerIcon })
                .addTo(map)
                .bindPopup(popupContent)
                .openPopup()
            map.setView(latLng, 13)
        }
    }, [map, latitude, longitude, hcf])

    return null
}

const LeafletMap = ({ lat, lng, hcf }) => {
    if (!lat && !lng) {
        return null
    }

    const center = [lat, lng]

    return (
        <div style={{ width: '100%', height: '400px' }}>
            <MapContainer
                key={`${center[0]}-${center[1]}`}
                style={{ height: '100%' }}
                center={center}
                zoom={13}
                zoomControl={false}
                minZoom={0}
                maxZoom={18}
            >
                <Suspense fallback={<div>Carregando...</div>}>
                    <MapControls />
                </Suspense>
                <DetalheColetaMap
                    latitude={lat}
                    longitude={lng}
                    hcf={hcf}
                />
            </MapContainer>
        </div>
    )
}

export default LeafletMap
