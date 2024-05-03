/* eslint-disable no-const-assign */
import {
    MapContainer, useMap, ZoomControl
} from 'react-leaflet'
import 'leaflet.markercluster/dist/leaflet.markercluster'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.fullscreen'
import 'leaflet.fullscreen/Control.FullScreen.css'
import 'leaflet-easyprint'
import '../assets/leaflet-plugins/leaflet.navbar.css'

import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import L from 'leaflet'

import React, { useEffect, useState } from 'react'

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
            requestAndAddMarkers()
        }, 0)
    })
}

function FullScreenControl() {
    const map = useMap()

    React.useEffect(() => {
        if (map && !map.fullscreenControl) {
            L.control.fullscreen({
                position: 'topright',
                title: 'Enter fullscreen mode'
            }).addTo(map)
        }

        return () => {
            if (map && map.fullscreenControl) {
                map.removeControl(map.fullscreenControl)
            }
        }
    }, [map])

    return null
}

function LayersControl() {
    const map = useMap()

    React.useEffect(() => {
        const scale = L.control.scale().addTo(map)
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
            Base: osm,
            Satélite: esriArcGis,
            Topografia: basetopo
        }

        const layerControl = L.control.layers(baseLayers).addTo(map)

        return () => {
            layerControl.remove()
            scale.remove()
        }
    }, [map])

    return null
}

function DownloadMapControl() {
    const map = useMap()

    React.useEffect(() => {
        const printer = L.easyPrint({
            title: 'Print Map',
            position: 'topright',
            sizeModes: ['A4Portrait', 'A4Landscape'],
            filename: 'MapPrint',
            exportOnly: true,
            hideControlContainer: false
        }).addTo(map)

        return () => {
            printer.remove(map)
        }
    }, [map])

    return null
}

function NavBarControl() {
    const map = useMap()

    useEffect(() => {
        const loadScript = async () => {
            await import('../assets/leaflet-plugins/leaflet.navbar.min')
            if (L.control.navbar) {
                const navbarControl = L.control.navbar({
                    position: 'topright',
                    center: [-24.0438, -52.3811],
                    zoom: 13
                })
                navbarControl.addTo(map)
            }
        }

        loadScript()

        return () => map.navbarControl && map.removeControl(map.navbarControl)
    }, [map])

    return null
}

function Mapa() {
    return (
        <div className={styles.page}>
            <MapContainer style={{ height: '100%' }} center={[-24.0438, -52.3811]} zoom={13} zoomControl={false}>
                <FullScreenControl />
                <ZoomControl position="topright" />
                <NavBarControl />
                <DownloadMapControl />
                <LayersControl />
                <MapLogic />
            </MapContainer>
        </div>
    )
}

export default Mapa
