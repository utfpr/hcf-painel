/* eslint-disable react-perf/jsx-no-new-object-as-prop */
import React from 'react';

import { ConfigProvider as AntDesignProvider } from 'antd';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import store from './redux/store';
import AntDesignLocale from './resources/locale';
import RouteManager from './routes';

function App() {
  return (
    <AntDesignProvider
      locale={AntDesignLocale}
      theme={{
        colorBgElevated: '#008b57',
        colorFill: '#008b57',

        token: {
          colorPrimary: '#33bc84',

        },
      }}
    >
      <BrowserRouter>
        <ReduxProvider store={store}>
          <RouteManager />
        </ReduxProvider>
      </BrowserRouter>
    </AntDesignProvider>
  );
}

export default App;
