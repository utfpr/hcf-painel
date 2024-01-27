import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_API_URL

axios.interceptors.request.use(
    request => {
        const token = localStorage.getItem('token')

        if (token) {
            request.headers.Authorization = `Bearer ${token}`
        }
        return request
    },
    error => Promise.reject(error)
)

window.global ||= window // See: https://stackoverflow.com/questions/72114775/vite-global-is-not-defined
