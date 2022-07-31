import axios from 'axios'; // inside .js file

import 'leaflet/dist/leaflet.css';

require('react-leaflet-markercluster/dist/styles.min.css');
// import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
// import 'leaflet-defaulticon-compatibility';

axios.defaults.baseURL = process.env.REACT_APP_API_URL;
