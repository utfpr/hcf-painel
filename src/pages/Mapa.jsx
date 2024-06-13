import 'leaflet.markercluster/dist/leaflet.markercluster'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.fullscreen'
import 'leaflet.fullscreen/Control.FullScreen.css'
import 'leaflet-easyprint'
import '../assets/leaflet-plugins/leaflet.navbar.css'

import React, { useEffect, useState } from 'react'

import axios from 'axios'
import L from 'leaflet'
import ReactDOMServer from 'react-dom/server'
import { MapContainer, useMap, ZoomControl } from 'react-leaflet'

import { PlusCircleTwoTone } from '@ant-design/icons'

import pin from '../assets/img/location-pin.png'
import styles from '../helpers/MapExamplePage.module.scss'
import '../helpers/MarkerClusterStyles.css'

const icon = new L.Icon({
    iconUrl: pin,
    iconRetinaUrl: pin,
    iconSize: new L.Point(20, 40)
})

function createClusterIcon(cluster) {
    const childCount = cluster.getChildCount()
    let c = ' marker-cluster-'
    if (childCount <= 10) {
        c += 'small'
    } else if (childCount <= 150) {
        c += 'medium'
    } else if (childCount <= 1000) {
        c += 'large'
    } else {
        c += 'xlarge'
    }

    return new L.DivIcon({
        html: `<div><span>${childCount}</span></div>`,
        className: `marker-cluster${c}`,
        iconSize: new L.Point(40, 40)
    })
}

function MapLogic() {
    const map = useMap()
    const [pontos, setPontos] = useState([])
    const [clusterMarkers] = useState(L.markerClusterGroup({
        iconCreateFunction: createClusterIcon,
        maxClusterRadius: 40
    }))

    useEffect(() => {
        // Fazer a requisição à API para buscar os pontos
        axios.get('http://localhost:3000/api/pontos')
            .then(response => {
                setPontos(response.data)
            })
            .catch(error => {
                console.error('Erro ao buscar os pontos: ', error)
            })
    }, [])

    useEffect(() => {
        if (map) {
            pontos.forEach(ponto => {
                const {
                    latitude, longitude, cidade, hcf
                } = ponto
                if (latitude && longitude) {
                    const marker = L.marker(new L.LatLng(latitude, longitude), { title: cidade, icon })
                    marker.bindPopup(`
                        <strong>HCF: ${hcf}</strong>
                        <br>
                        <button 
                            onclick="window.location.href='/tombos/detalhes/${hcf}'"
                            style="background: none; border: none; cursor: pointer; display: flex; justify-content: center; align-items: center; margin: 0 auto;"
                        >
                            <span style="color: #008000; font-size: 24px;">
                                ${ReactDOMServer.renderToString(<PlusCircleTwoTone twoToneColor="#008000" />)}
                            </span>
                        </button>
                    `)
                    clusterMarkers.addLayer(marker)
                }
            })

            map.addLayer(clusterMarkers)

            const updateMarkers = () => {
                const currentZoom = map.getZoom()
                if (currentZoom >= 17) {
                    const bounds = map.getBounds()
                    const visibleMarkers = L.layerGroup()

                    pontos.forEach(ponto => {
                        const {
                            latitude, longitude, cidade, hcf
                        } = ponto
                        if (latitude && longitude) {
                            const latLng = new L.LatLng(latitude, longitude)
                            if (bounds.contains(latLng)) {
                                const marker = L.marker(latLng, { title: cidade, icon })
                                marker.bindPopup(`
                                    <strong>HCF: ${hcf}</strong>
                                    <br>
                                    <button 
                                        onclick="window.location.href='/tombos/detalhes/${hcf}'"
                                        style="background: none; border: none; cursor: pointer; display: flex; justify-content: center; align-items: center; margin: 0 auto;"
                                    >
                                        <span style="color: #008000; font-size: 24px;">
                                            ${ReactDOMServer.renderToString(<PlusCircleTwoTone twoToneColor="#008000" />)}
                                        </span>
                                    </button>
                                `)
                                visibleMarkers.addLayer(marker)
                            }
                        }
                    })

                    map.removeLayer(clusterMarkers)
                    map.addLayer(visibleMarkers)
                } else {
                    map.eachLayer(layer => {
                        if (layer instanceof L.Marker && !(layer instanceof L.MarkerCluster)) {
                            map.removeLayer(layer)
                        }
                    })
                    map.addLayer(clusterMarkers)
                }
            }

            map.on('zoomend moveend', updateMarkers)
            updateMarkers()
        }
    }, [map, pontos, clusterMarkers])

    return null
}

function FullScreenControl() {
    const map = useMap()

    useEffect(() => {
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

    useEffect(() => {
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

    useEffect(() => {
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
