/* eslint-disable import/no-extraneous-dependencies */
import { useEffect } from 'react'

import L from 'leaflet'

const LeafletMap = ({ lat, lng }) => {
    if (!lat && !lng) {
        return null
    }

    useEffect(
        () => {
            const map = L.map('map').setView([lat, lng], 13)

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map)

            L.marker([lat, lng]).addTo(map)
                .bindPopup('Local de coleta')
                .openPopup()

            return () => map.remove()
        },
        [lat, lng]
    )

    return (
        <div id="map" style={{ width: '100%', height: '400px' }} />
    )
}

export default LeafletMap
