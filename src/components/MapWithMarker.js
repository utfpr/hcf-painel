/* eslint-disable react-perf/jsx-no-new-array-as-prop */
import React from 'react';

import L from 'leaflet';
import {
  MapContainer, TileLayer, Marker,
} from 'react-leaflet';

import pin from '../assets/pin.svg';

const iconPin = new L.Icon({
  iconUrl: pin,
  iconRetinaUrl: pin,
  iconSize: new L.Point(40, 60),
});

const mapStyle = { height: '80vh' };

const MapWithMarker = ({ coordinates = [], style }) => {
  return (
    <MapContainer
      center={coordinates}
      zoom={10}
      scrollWheelZoom={false}
      style={style || mapStyle}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        icon={iconPin}
        position={coordinates}
      />
    </MapContainer>
  );
};
export default MapWithMarker;
