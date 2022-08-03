/* eslint-disable no-unused-vars */
/* eslint-disable react-perf/jsx-no-new-array-as-prop */
import React, { useMemo, useState } from 'react';
import { render } from 'react-dom';

import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import { StaticMap } from 'react-map-gl';

import useAsync from '../hooks/use-async';
import useDidMount from '../hooks/use-did-mount';
import { getHeatmapCoordinatesTombos, getTombos } from '../services/tombo-service';

const ambientLight = new AmbientLight({
    color: [255, 255, 255],
    intensity: 1.0,
});

const pointLight1 = new PointLight({
    color: [255, 255, 255],
    intensity: 0.8,
    position: [-0.144528, 49.739968, 80000],
});

const pointLight2 = new PointLight({
    color: [255, 255, 255],
    intensity: 0.8,
    position: [-3.807751, 54.104682, 8000],
});

const lightingEffect = new LightingEffect({ ambientLight, pointLight1, pointLight2 });

const material = {
    ambient: 0.64,
    diffuse: 0.6,
    shininess: 32,
    specularColor: [51, 51, 51],
};

const INITIAL_VIEW_STATE = {
    longitude: -50.195322,
    latitude: -25.328785,
    zoom: 6.6,
    // minZoom: 5,
    maxZoom: 8,
    pitch: 40.5,
    bearing: -27,
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

export const colorRange = [
    [1, 152, 189],
    [73, 227, 206],
    [216, 254, 181],
    [254, 237, 177],
    [254, 173, 84],
    [209, 55, 78],
];

function getTooltip({ object }) {
    if (!object) {
        return null;
    }
    const lat = object.position[1];
    const lng = object.position[0];
    const count = object.points.length;

    return `\
    latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ''}
    longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ''}
    ${count} Tombos`;
}

/* eslint-disable react/no-deprecated */
function MapaDash({
    data,
    mapStyle = MAP_STYLE,
    radius = 1000,
    upperPercentile = 100,
    coverage = 1,
}) {
    const layers = [
        new HexagonLayer({
            id: 'heatmap',
            colorRange,
            coverage,
            data,
            elevationRange: [0, 3000],
            elevationScale: data && data.length ? 50 : 0,
            extruded: true,
            getPosition: d => d,
            pickable: true,
            radius,
            upperPercentile,
            material,

            transitions: {
                elevationScale: 3000,
            },
        }),
    ];

    return (
        <DeckGL
            layers={layers}
            effects={[lightingEffect]}
            initialViewState={INITIAL_VIEW_STATE}
            controller
            getTooltip={getTooltip}
        >
            <StaticMap reuseMaps mapStyle={mapStyle} preventStyleDiffing />
        </DeckGL>
    );
}

export default function DashboardPage() {
    const [coordinates, setCoordinates] = useState([]);
    const [loading, requestTombos] = useAsync(async () => {
        const data = await getHeatmapCoordinatesTombos();
        if (data) {
            setCoordinates(data);
        }
    });

    useDidMount(() => {
        requestTombos();
    });

    return (
        <MapaDash data={coordinates} />
    );
}
