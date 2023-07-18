import axios from 'axios'

import 'leaflet/dist/leaflet.css'

// require('react-leaflet-markercluster/dist/styles.min.css');
// import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
// import 'leaflet-defaulticon-compatibility';

axios.defaults.baseURL = import.meta.env.VITE_API_URL
