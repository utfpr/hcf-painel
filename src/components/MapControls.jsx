import React, { useEffect } from 'react'

import L from 'leaflet'
import { useMap } from 'react-leaflet'
import 'leaflet.fullscreen/Control.FullScreen'
import 'leaflet.fullscreen/Control.FullScreen.css'
import 'leaflet-easyprint'

const MapControls = () => {
    const map = useMap()

    useEffect(() => {
        if (map && !map.fullscreenControl) {
            L.control.fullscreen({
                position: 'topright',
                title: 'Modo tela cheia'
            }).addTo(map)
        }

        const zoomControl = new L.Control.Zoom({ position: 'topright' })
        map.addControl(zoomControl)

        const printer = L.easyPrint({
            title: 'Print Mapa',
            position: 'topright',
            sizeModes: ['A4Portrait', 'A4Landscape'],
            filename: 'MapPrint',
            exportOnly: true,
            hideControlContainer: false
        }).addTo(map)

        const scale = L.control.scale().addTo(map)

        const baseLayers = {
            Base: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }),
            Satélite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            }),
            Topografia: L.tileLayer('https://tile.opentopomap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
                maxZoom: 17
            })
        }

        L.control.layers(baseLayers).addTo(map)
        baseLayers.Base.addTo(map)

        const loadNavBarScript = async () => {
            await import('../helpers/leaflet-plugins/leaflet.navbar.min')
            if (L.control.navbar) {
                const navbarControl = L.control.navbar({
                    position: 'topright',
                    zoom: 13
                })
                navbarControl.addTo(map)
            }
        }

        loadNavBarScript()

        return () => {
            if (map.fullscreenControl) {
                map.removeControl(map.fullscreenControl)
            }
            map.removeControl(zoomControl)
            map.removeControl(scale)
            map.removeControl(printer)
            if (map.navbarControl) {
                map.removeControl(map.navbarControl)
            }
        }
    }, [map])

    return null
}

export default MapControls
