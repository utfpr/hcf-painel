import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_API_URL

window.global ||= window // See: https://stackoverflow.com/questions/72114775/vite-global-is-not-defined
