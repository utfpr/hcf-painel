import 'leaflet.markercluster/dist/leaflet.markercluster'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.fullscreen'
import 'leaflet.fullscreen/Control.FullScreen.css'
import 'leaflet-easyprint'
import '../helpers/leaflet-plugins/leaflet.navbar.css'

import React, {
    Suspense, lazy, useEffect, useState, useRef
} from 'react'

import axios from 'axios'
import L from 'leaflet'
import ReactDOM from 'react-dom/client'
import { MapContainer, useMap } from 'react-leaflet'

import pinVerde from '../assets/img/pin-verde.svg'
import pin from '../assets/img/pin.svg'
import PopupContentCity from '../components/PopupContentCity'
import PopupContentGreen from '../components/PopupContentGreen'
import '../assets/css/MarkerClusterStyles.css'
import '../assets/css/Map.css'

const MapControls = lazy(() => import('../components/MapControls'))

const icon = new L.Icon({
    iconUrl: pinVerde,
    iconRetinaUrl: pinVerde,
    iconSize: new L.Point(20, 40)
})

const iconVerde = new L.Icon({
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

function MapLogic({ setLoading }) {
    const map = useMap()
    const [pontos, setPontos] = useState([])
    const clusterMarkersRef = useRef(L.markerClusterGroup({
        iconCreateFunction: createClusterIcon,
        maxClusterRadius: 40
    }))
    const visibleMarkersRef = useRef(L.layerGroup())

    useEffect(() => {
        setLoading(true)
        axios.get('http://localhost:3000/api/pontos')
            .then(response => {
                setPontos(response.data.map(ponto => ({
                    ...ponto
                })))
                setLoading(false)
                setTimeout(() => {
                    map.invalidateSize()
                }, 0)
            })
            .catch(error => {
                console.error('Erro ao buscar os pontos: ', error)
                setLoading(false)
            })
    }, [setLoading, map])

    useEffect(() => {
        if (map && pontos.length > 0) {
            const clusterMarkers = clusterMarkersRef.current
            const visibleMarkers = visibleMarkersRef.current
            clusterMarkers.clearLayers()
            visibleMarkers.clearLayers()

            const citiesPlotted = new Set()

            pontos.forEach(ponto => {
                const {
                    latitude, longitude, cidade, hcf, latitudeCidade, longitudeCidade
                } = ponto
                let latLng = null
                let markerIcon = null

                if (latitude && longitude) {
                    latLng = new L.LatLng(latitude, longitude)
                    markerIcon = icon
                } else if (latitudeCidade && longitudeCidade && !citiesPlotted.has(cidade)) {
                    latLng = new L.LatLng(latitudeCidade, longitudeCidade)
                    markerIcon = iconVerde
                    citiesPlotted.add(cidade)
                }

                if (latLng) {
                    const marker = L.marker(latLng, { title: cidade, icon: markerIcon })
                    marker.on('click', () => {
                        map.eachLayer(layer => {
                            if (layer instanceof L.Popup) {
                                map.removeLayer(layer)
                            }
                        })

                        const popupContent = document.createElement('div')
                        const root = ReactDOM.createRoot(popupContent)

                        if (latitude && longitude) {
                            axios.get(`http://localhost:3000/api/tombos/${hcf}`)
                                .then(response => {
                                    root.render(<PopupContentGreen hcf={response.data.hcf} />)
                                    marker.bindPopup(popupContent)
                                    marker.openPopup()
                                    setTimeout(() => marker.openPopup(), 0)
                                })
                                .catch(error => {
                                    console.error('Erro ao buscar detalhes do ponto: ', error)
                                })
                        } else {
                            root.render(<PopupContentCity cidade={cidade} />)
                            marker.bindPopup(popupContent)
                            marker.openPopup()
                            setTimeout(() => marker.openPopup(), 0)
                        }
                    })
                    clusterMarkers.addLayer(marker)
                }
            })

            map.addLayer(clusterMarkers)

            const updateMarkers = () => {
                const currentZoom = map.getZoom()
                if (currentZoom >= 17) {
                    const bounds = map.getBounds()
                    clusterMarkers.eachLayer(layer => {
                        const marker = layer
                        if (bounds.contains(marker.getLatLng())) {
                            visibleMarkers.addLayer(marker)
                        }
                    })
                    map.removeLayer(clusterMarkers)
                    map.addLayer(visibleMarkers)
                } else {
                    map.removeLayer(visibleMarkers)
                    map.addLayer(clusterMarkers)
                }
            }

            const debounceUpdateMarkers = debounce(updateMarkers, 200)

            map.on('zoomend moveend', () => {
                requestAnimationFrame(debounceUpdateMarkers)
            })
            updateMarkers()
        }
    }, [map, pontos])

    return null
}

function debounce(func, wait) {
    let timeout
    return function (...args) {
        const context = this
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(context, args), wait)
    }
}

function Mapa() {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!isLoading) {
            document.getElementById('map-container').style.display = 'block'
            setTimeout(() => {
                const mapContainer = document.querySelector('.leaflet-container')
                if (mapContainer) {
                    const mapInstance = mapContainer._leaflet_map // eslint-disable-line
                    if (mapInstance) {
                        mapInstance.invalidateSize()
                    }
                }
            }, 0)
        }
    }, [isLoading])

    return (
        <div style={{ padding: '1rem', height: '800px', position: 'relative' }}>
            {isLoading && (
                <div className="loading-container">
                    <div className="spinner" />
                    <p className="loading-text">analisando dados...</p>
                </div>
            )}
            <div id="map-container" style={{ height: '100%', display: 'none' }}>
                <MapContainer
                    style={{ height: '100%' }}
                    center={[-24.0438, -52.3811]}
                    zoom={13}
                    zoomControl={false}
                    minZoom={0}
                    maxZoom={18}
                >
                    <Suspense>
                        <MapControls />
                    </Suspense>
                    <MapLogic setLoading={setIsLoading} />
                </MapContainer>
            </div>
        </div>
    )
}

export default Mapa
