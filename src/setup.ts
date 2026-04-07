import axios, { AxiosError } from 'axios'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isoWeek from 'dayjs/plugin/isoWeek'
import localeData from 'dayjs/plugin/localeData'
import weekday from 'dayjs/plugin/weekday'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import weekYear from 'dayjs/plugin/weekYear'
import 'dayjs/locale/pt-br'

import { getCookie, removeCookie } from './helpers/cookie'

// Same plugins as rc-picker/lib/generate/dayjs so project dayjs() values work in DatePicker/RangePicker.
dayjs.extend(customParseFormat)
dayjs.extend(advancedFormat)
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(weekOfYear)
dayjs.extend(weekYear)
dayjs.extend(isoWeek)
dayjs.locale('pt-br')

axios.defaults.baseURL = import.meta.env.VITE_API_URL

axios.interceptors.request.use(
  request => {
    const token = getCookie<string>('Access_Token')
    if (token) {
      request.headers.Authorization = `Bearer ${token}`
    }
    return request
  },
  (error: AxiosError) => Promise.reject(error)
)

axios.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const err: { error: { code: number } } = error.response?.data as { error: { code: number } }

    if (err.error.code === 401) {
      removeCookie('Access_Token')
      window.localStorage.removeItem('Logged_User')
      window.location.href = '/inicio'
    }
    return Promise.reject(error)
  }
)

window.global ||= window // See: https://stackoverflow.com/questions/72114775/vite-global-is-not-defined
