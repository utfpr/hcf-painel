import React, {
    useState, useRef, useEffect, Suspense
} from 'react'

import axios from 'axios'
import L from 'leaflet'
import ReactDOM from 'react-dom/client'
import {
    MapContainer, Marker, Popup, useMap
} from 'react-leaflet'

import pin from '../assets/img/pin-verde.svg'
import FiltersMap from '../components/FiltersMap'
import MapControls from '../components/MapControls'
import PopupContentGreen from '../components/PopupContentGreen'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.fullscreen'
import 'leaflet.fullscreen/Control.FullScreen.css'
import '../helpers/leaflet-plugins/leaflet.navbar.css'

const icon = new L.Icon({
    iconUrl: pin,
    iconRetinaUrl: pin,
    iconSize: new L.Point(20, 40)
})

function RecenterMap({ lat, lng }) {
    const map = useMap()
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], 13, { animate: true })
        }
    }, [lat, lng, map])
    return null
}

function ClusterLayer({ markers, clusterGroup }) {
    const map = useMap()

    useEffect(() => {
        if (markers.length > 0) {
            clusterGroup.clearLayers()

            markers.forEach(marker => {
                const { latitude, longitude, hcf } = marker
                if (latitude && longitude) {
                    const markerInstance = L.marker([latitude, longitude], { icon })

                    const popupContent = document.createElement('div')
                    const root = ReactDOM.createRoot(popupContent)

                    root.render(<PopupContentGreen hcf={hcf} />)

                    markerInstance.bindPopup(popupContent)
                    clusterGroup.addLayer(markerInstance)
                }
            })

            map.addLayer(clusterGroup)
        }

        return () => {
            map.removeLayer(clusterGroup)
        }
    }, [markers, clusterGroup, map])

    return null
}

const FiltrosMapa = () => {
    const initialCenter = [-24.0438, -52.3811]
    const [center, setCenter] = useState(initialCenter)
    const [markers, setMarkers] = useState([])
    const [hcfData, setHcfData] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const clusterMarkersRef = useRef(L.markerClusterGroup())
    const [totalRegistros, setTotalRegistros] = useState(0)

    const handleSearch = async filters => {
        const {
            hcf, altitudeMin, altitudeMax, nomesPopulares, nomeCientifico
        } = filters

        const taxonomiaOptions = ['Reino', 'Família', 'SubFamília', 'Gênero', 'Espécie', 'SubEspécie', 'Variedade']

        try {
            if (hcf) {
                const response = await axios.get(`/buscaHCF/${hcf}`)
                const { latitude, longitude, cidade } = response.data

                if (latitude && longitude) {
                    setCenter([latitude, longitude])
                    setMarkers([{ latitude, longitude, hcf }])
                    setErrorMessage(null)
                } else {
                    setErrorMessage(`O HCF ${hcf} está em ${cidade.nome}, porém não possui coordenadas registradas.`)
                }
                return
            }

            if (altitudeMin && altitudeMax) {
                if (!altitudeMin || !altitudeMax) {
                    setErrorMessage('Ambos os campos de altitude (Mínimo e Máximo) devem ser preenchidos.')
                    return
                }

                if (parseFloat(altitudeMin) > parseFloat(altitudeMax)) {
                    setErrorMessage('O valor mínimo da altitude não pode ser maior que o valor máximo.')
                    return
                }

                const response = await axios.get(
                    `/buscaHcfsPorAltitude/${altitudeMin}/${altitudeMax}`
                )
                const { resultados, total } = response.data

                if (resultados.length > 0) {
                    setTotalRegistros(total)
                    setMarkers(resultados)
                    setCenter([resultados[0].latitude, resultados[0].longitude])
                    setErrorMessage(null)
                } else {
                    setMarkers([])
                    setTotalRegistros(0)
                    setErrorMessage('Nenhum ponto encontrado para o intervalo de altitude especificado.')
                }
                return
            }

            // eslint-disable-next-line max-len
            if (taxonomiaOptions.some(option => filters[`taxonomia_${option}`] && filters[`taxonomia_${option}`].trim() !== '')) {
                const taxonomyParams = {}

                taxonomiaOptions.forEach(taxonomia => {
                    const paramKey = `nome${taxonomia.replace(/\s+/g, '').normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')}`

                    // Se o usuário preencheu algum valor, adicionamos ao objeto de parâmetros
                    if (filters[`taxonomia_${taxonomia}`] && filters[`taxonomia_${taxonomia}`].trim() !== '') {
                        taxonomyParams[paramKey] = filters[`taxonomia_${taxonomia}`]
                    }
                })

                const queryString = new URLSearchParams(taxonomyParams).toString()

                try {
                    const response = await axios.get(`/pontosTaxonomiaComFiltros?${queryString}`)
                    const { resultados, total } = response.data

                    if (resultados.length > 0) {
                        setMarkers(resultados)
                        setTotalRegistros(total)
                        setCenter([resultados[0].latitude, resultados[0].longitude])
                        setErrorMessage(null)
                    } else {
                        setMarkers([])
                        setTotalRegistros(0)
                        setErrorMessage('Nenhum ponto encontrado para os filtros de taxonomia especificados.')
                    }
                } catch (error) {
                    setErrorMessage(error.response?.data?.message || 'Revise os dados e tente novamente.')
                    setTotalRegistros(0)
                }
                return
            }

            if (nomesPopulares) {
                const response = await axios.get(
                    `/pontosPorNomePopular?nomePopular=${encodeURIComponent(nomesPopulares)}`
                )
                const { resultados, total } = response.data

                if (resultados.length > 0) {
                    setMarkers(resultados)
                    setTotalRegistros(total)
                    setCenter([resultados[0].latitude, resultados[0].longitude])
                    setErrorMessage(null)
                } else {
                    setMarkers([])
                    setTotalRegistros(0)
                    setErrorMessage('Nenhum ponto encontrado para o nome popular informado.')
                }
                return
            }

            if (nomeCientifico) {
                const response = await axios.get(
                    `/pontosPorNomeCientifico?nomeCientifico=${encodeURIComponent(nomeCientifico)}`
                )
                const { resultados, total } = response.data

                if (resultados.length > 0) {
                    setMarkers(resultados)
                    setTotalRegistros(total)
                    setCenter([resultados[0].latitude, resultados[0].longitude])
                    setErrorMessage(null)
                } else {
                    setMarkers([])
                    setTotalRegistros(0)
                    setErrorMessage('Nenhum ponto encontrado para o nome científico informado.')
                }
                return
            }

            setErrorMessage('Nenhum filtro válido foi aplicado.')
            setTotalRegistros(0)
        } catch (error) {
            setErrorMessage('Erro ao buscar dados. Tente novamente.')
        }
    }

    const handleClear = () => {
        setCenter(initialCenter)
        setMarkers([])
        setHcfData(null)
        setErrorMessage(null)
        setTotalRegistros(0)
        clusterMarkersRef.current.clearLayers()
    }

    return (
        <div style={{ padding: '1rem' }}>
            <FiltersMap onSearch={handleSearch} onClear={handleClear} />
            {errorMessage && (
                <div style={{ marginTop: '1rem', color: 'red' }}>
                    {errorMessage}
                </div>
            )}

            {totalRegistros > 0 && (
                <div style={{ color: '#8c8c8c' }}>
                    Foram encontrados
                    {' '}
                    <strong>{totalRegistros}</strong>
                    {' '}
                    registros com geolocalização para os filtros aplicados.
                </div>
            )}
            <div style={{ width: '100%', height: '500px' }}>
                <MapContainer
                    style={{ height: '100%' }}
                    center={center}
                    zoom={13}
                    zoomControl={false}
                >
                    <Suspense fallback={<div>Carregando...</div>}>
                        <MapControls />
                    </Suspense>
                    <RecenterMap lat={center[0]} lng={center[1]} />
                    <ClusterLayer markers={markers} clusterGroup={clusterMarkersRef.current} />
                    {hcfData && hcfData.latitude && hcfData.longitude && (
                        <Marker position={[hcfData.latitude, hcfData.longitude]} icon={icon}>
                            <Popup>
                                <PopupContentGreen hcf={hcfData.hcf} />
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </div>
    )
}

export default FiltrosMapa
