import {
    MapContainer, TileLayer, useMapEvent, useMap
} from 'react-leaflet'
import 'leaflet.markercluster/dist/leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import L from 'leaflet'

import pin from '../assets/img/pin.svg'
import styles from '../helpers/MapExamplePage.module.scss'
import points from '../helpers/points.json'

const icon = new L.Icon({
    iconUrl: pin,
    iconRetinaUrl: pin,
    iconSize: new L.Point(20, 40)
})

function MapLogic() {
    const map = useMap()

    const requestAndAddMarkers = () => {
        const markers = L.markerClusterGroup()

        points.forEach(point => {
            const [latitude, longitude, title] = point
            const marker = L.marker(new L.LatLng(latitude, longitude), { title, icon })

            marker.bindPopup(title)
            markers.addLayer(marker)
        })

        map.addLayer(markers)
    }

    map.whenReady(() => {
        setTimeout(() => {
            requestAndAddMarkers() // Must be inside "setTimeout"
        }, 0)
    })

    useMapEvent('zoomend', () => {
        console.log('User changed zoom')
        console.log(map.getBounds()) // Gets the coordinates and requests the markers from the API
    })
}

const center = [-24.0438, -52.3811]

const mapContainerStyle = { height: '100%' }

function Mapa() {
    return (
        <div className={styles.page}>
            <MapContainer center={center} zoom={13} scrollWheelZoom style={mapContainerStyle}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapLogic />
            </MapContainer>
        </div>
    )
}

export default Mapa
