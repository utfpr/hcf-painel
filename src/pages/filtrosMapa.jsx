import React, {
    Suspense, lazy, useEffect, useState, useRef
} from 'react'

import {
    Card, Form, Button, Select, Row, Col, Input, Typography
} from 'antd'
import axios from 'axios'
import L from 'leaflet'
import ReactDOM from 'react-dom/client'
import {
    MapContainer, Marker, Popup, useMap
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.fullscreen'
import 'leaflet.fullscreen/Control.FullScreen.css'
import '../helpers/leaflet-plugins/leaflet.navbar.css'
import pin from '../assets/img/pin-verde.svg'
import PopupContentGreen from '../components/PopupContentGreen'

const { Text } = Typography
const { Option } = Select
const MapControls = lazy(() => import('../components/MapControls'))

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
    const [hcfNumber, setHcfNumber] = useState(null)
    const [altitudeRange, setAltitudeRange] = useState('')
    const [totalRegistros, setTotalRegistros] = useState(0)
    const [errorMessage, setErrorMessage] = useState(null)
    const [hcfData, setHcfData] = useState(null)
    const [markers, setMarkers] = useState([])
    const clusterMarkersRef = useRef(L.markerClusterGroup())

    const handleSearch = async () => {
        if (hcfNumber) {
            try {
                const response = await axios.get(`http://localhost:3000/api/buscaHCF/${hcfNumber}`)
                const {
                    latitude, longitude, hcf, cidade
                } = response.data

                if (latitude !== null && longitude !== null) {
                    setCenter([latitude, longitude])
                    setHcfData(response.data)
                    setErrorMessage(null)
                } else {
                    setErrorMessage(`O HCF ${hcf} está em ${cidade.nome}, porém não possui coordenadas registradas.`)
                    setHcfData(null)
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setErrorMessage(`O HCF ${hcfNumber} não foi encontrado.`)
                } else {
                    setErrorMessage('Este HCF não existe, tente novamente.')
                }
                setHcfData(null)
            }
        } else if (altitudeRange) {
            const [altitudeMin, altitudeMax] = altitudeRange.split('-').map(Number)
            if (altitudeMin != null && altitudeMax != null) {
                try {
                    // eslint-disable-next-line max-len
                    const response = await axios.get(`http://localhost:3000/api/buscaHcfsPorAltitude/${altitudeMin}/${altitudeMax}`)
                    const { resultados, total } = response.data

                    if (resultados.length > 0) {
                        setMarkers(resultados)
                        setTotalRegistros(total)
                        setCenter([resultados[0].latitude, resultados[0].longitude])
                        setErrorMessage(null)
                    } else {
                        setMarkers([])
                        setTotalRegistros(0)
                        setErrorMessage('Nenhum HCF encontrado para os valores de altitude especificados.')
                    }
                } catch (error) {
                    setMarkers([])
                    setTotalRegistros(0)
                    setErrorMessage('Erro ao buscar dados. Tente novamente.')
                }
            } else {
                setErrorMessage('Por favor, insira um intervalo de altitude válido (ex: 1800-2000).')
            }
        }
    }

    const handleClear = () => {
        setCenter(initialCenter)
        setHcfNumber(null)
        setAltitudeRange('')
        setErrorMessage(null)
        setHcfData(null)
        setMarkers([])
        setTotalRegistros(0)
        clusterMarkersRef.current.clearLayers()
    }

    return (
        <div style={{ padding: '1rem' }}>
            <Card title="Filtros do mapa" style={{ marginBottom: '1rem font-weight: bold' }}>
                <Form layout="vertical">
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item label="Buscar por número HCF:">
                                <Input
                                    placeholder="Digite o número HCF. ex: 28140"
                                    value={hcfNumber}
                                    onChange={e => {
                                        const onlyNumbers = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
                                        setHcfNumber(onlyNumbers)
                                    }}
                                    style={{ width: '100%' }}
                                    maxLength={10}
                                />
                                {errorMessage && <Text type="danger">{errorMessage}</Text>}
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item label="Buscar por altitude (min-max):">
                                <Input
                                    placeholder="ex: 1800-2000"
                                    value={altitudeRange}
                                    onChange={e => setAltitudeRange(e.target.value)}
                                    style={{ width: '100%' }}
                                />
                                {totalRegistros > 0 && (
                                    <Text style={{ display: 'block', marginTop: '8px', color: '#8c8c8c' }}>
                                        Foram encontrados
                                        {' '}
                                        {totalRegistros}
                                        {' '}
                                        registros.
                                    </Text>
                                )}
                            </Form.Item>

                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item label="Buscar por taxonomia:">
                                <Select placeholder="Selecione" allowClear disabled>
                                    <Option value="familia">Família</Option>
                                    <Option value="subfamilia">Subfamília</Option>
                                    <Option value="genero">Gênero</Option>
                                    <Option value="especie">Espécie</Option>
                                    <Option value="subespecie">Subespécie</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item label="Buscar por nome científico:">
                                <Input placeholder="ex: Passiflora edulis" disabled />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Form.Item label="Buscar por nome popular:">
                                <Input placeholder="ex: Maracujá" disabled />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify="end" gutter={16}>
                        <Col>
                            <Button onClick={handleClear}>
                                Limpar
                            </Button>
                        </Col>
                        <Col>
                            <Button type="primary" onClick={handleSearch}>
                                Pesquisar
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>

            {/* Mapa */}
            <div style={{ width: '100%', height: '400px' }}>
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
