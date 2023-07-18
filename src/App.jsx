import React from 'react'

import './App.scss'
import 'antd/dist/antd.css'
import 'react-image-gallery/styles/css/image-gallery.css'

import { ConfigProvider as AntDesignProvider } from 'antd'
import { BrowserRouter } from 'react-router-dom'

import AntDesignLocale from './resources/locale'
import RouteManager from './routes'

function App() {
  return (
    <AntDesignProvider
      locale={AntDesignLocale}
      theme={{
        colorBgElevated: '#008b57',
        colorFill: '#008b57',

        token: {
          colorPrimary: '#33bc84'
        }
      }}
    >
      <BrowserRouter>
        <RouteManager />
      </BrowserRouter>
    </AntDesignProvider>
  )
}

export default App
