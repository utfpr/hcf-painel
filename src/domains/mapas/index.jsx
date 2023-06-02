/* eslint-disable no-unused-vars */
/* eslint-disable react-perf/jsx-no-new-object-as-prop */
/* eslint-disable react-perf/jsx-no-new-array-as-prop */
import React, { useState } from 'react'

import { Space } from 'antd'
import L from 'leaflet'
import {
  MapContainer, TileLayer, Marker, Popup
} from 'react-leaflet'

import pin from '../../assets/pin.svg'
import useAsync from '../../hooks/use-async'
import useDidMount from '../../hooks/use-did-mount'
import { getTombos } from '../../services/tombo-service'

const position = [-24.0438, -52.3811]

const iconPin = new L.Icon({
  iconUrl: pin,
  iconRetinaUrl: pin,
  iconSize: new L.Point(20, 40)
})

const MapasPage = () => {
  const [tombos, setTombos] = useState([])
  const [, setMetadata] = useState({
    page: 1
  })
  const [currentPage, setCurrentPage] = useState(1)

  const [, requestTombos] = useAsync(async page => {
    const data = await getTombos(page, 300)
    if (data) {
      setMetadata(data.metadata)
      setCurrentPage(data.metadata.page)
      setTombos([
        ...tombos,
        ...data.records
      ])
    }
  })

  useDidMount(() => {
    requestTombos(currentPage)
      .catch(console.warn)
  })

  return (
    <MapContainer
      center={position}
      zoom={5}
      scrollWheelZoom={false}
      style={{ height: '80vh' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* <MarkerClusterGroup> */}
      {tombos.map(tombo => {
        if (tombo.latitude && tombo.longitude) {
          return (
            <Marker
              icon={iconPin}
              position={[tombo.latitude, tombo.longitude]}
            >
              <Popup>
                <Space>
                  {`HCF-${tombo.hcf}`}
                </Space>
              </Popup>
            </Marker>
          )
        }
        return null
      })}
      {/* </MarkerClusterGroup> */}
    </MapContainer>
  )
}

export default MapasPage
