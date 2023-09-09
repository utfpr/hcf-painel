import React, { Component } from 'react';

const { compose, withProps, withState, withHandlers } = require("recompose");
const FaAnchor = require("react-icons/lib/fa/anchor");
const {
	withScriptjs,
	withGoogleMap,
	GoogleMap,
	Marker,
	InfoWindow
} = require("react-google-maps");

let latitude = -25.719437;
let longitude = -47.524082;

const MapWithControledZoom = compose(
	withProps({
		googleMapURL:
			"https://maps.googleapis.com/maps/api/js?key=AIzaSyDDl7wyNwnDS-RMxI-t3Hil5Rrn7RrUsTQ&libraries=geometry,drawing,places",
		loadingElement: <div style={{ height: `100%` }} />,
		containerElement: <div style={{ height: `400px` }} />,
		mapElement: <div style={{ height: `100%` }} />
	}),
	withState("zoom", "onZoomChange", 8),
	withHandlers(() => {
		const refs = {
			map: undefined
		};

		return {
			onMapMounted: () => ref => {
				refs.map = ref;
			},
			onZoomChanged: ({ onZoomChange }) => () => {
				onZoomChange(refs.map.getZoom());
			}
		};
	}),
	withScriptjs,
	withGoogleMap
)(props => (
	<GoogleMap
		defaultCenter={{ lat: latitude, lng: longitude }}
		zoom={props.zoom}
		ref={props.onMapMounted}
		onZoomChanged={props.onZoomChanged}
	>
		<Marker
			position={{ lat: latitude, lng: longitude }}
			onClick={props.onToggleOpen}
		>
			<InfoWindow onCloseClick={props.onToggleOpen}>
				<div>
					<FaAnchor /> Local de coleta
				</div>
			</InfoWindow>
		</Marker>
	</GoogleMap>
));

export default class MapWithControlledZoom extends Component {
	constructor(props) {
		super(props);
		latitude = props.lat === null ? latitude : props.lat;
		longitude = props.lng === null ? longitude : props.lng;
	}

	render() {
		return <MapWithControledZoom />;
	}
}
