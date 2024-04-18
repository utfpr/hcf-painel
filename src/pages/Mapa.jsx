/* eslint-disable no-const-assign */
import {
    MapContainer, TileLayer, useMapEvent, useMap
} from 'react-leaflet'
import 'leaflet.markercluster/dist/leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import L from 'leaflet'

import React from 'react'

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

function LayersControl() {
    const map = useMap()

    React.useEffect(() => {
        const scale = L.control.scale().addTo(map)
        // map.attributionControl.addAttribution('OpenTopoMap')
        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map)

        const basetopo = L.tileLayer('https://tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
            maxZoom: 17
        })

        const esriArcGis = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        })

        const baseLayers = {
            Padrão: osm,
            Satélite: esriArcGis,
            Relevo: basetopo
        }

        const layerControl = L.control.layers(baseLayers).addTo(map)

        return () => {
            layerControl.remove()
            scale.remove()
        }
    }, [map])

    return null
}

function Mapa() {
    return (
        <div className={styles.page}>
            <MapContainer style={{ height: '100%' }} center={[-24.0438, -52.3811]} zoom={13}>
                <LayersControl />
                <MapLogic />
            </MapContainer>
        </div>
    )
}

export default Mapa
