// import React from 'react';
// import { render } from 'react-dom';
// import registerServiceWorker from './registerServiceWorker';
// import App from './App';

// render(<App />, document.getElementById('root'));

// registerServiceWorker();
import React from 'react'

import ReactDOM from 'react-dom/client'
import axios from 'axios';

import './assets/css/App.css';
import './assets/css/FormEnterSystem.css';
import './assets/css/Main.css';
import './assets/css/Search.css';
import "react-image-gallery/styles/scss/image-gallery.scss";

import { baseUrl } from './config/api';

import {
    getTokenUsuario,
} from './helpers/usuarios';

axios.defaults.baseURL = baseUrl;
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.interceptors.request.use(config => {
    config.headers['token'] = getTokenUsuario();
    return config;
});

import App from './App'

ReactDOM.createRoot(document.getElementById('root')!)
    .render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    )
