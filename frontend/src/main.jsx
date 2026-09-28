import React from 'react';
import ReactDOM from 'react-dom/client';
import {ConfigProvider,theme} from 'antd';
import ruRU from 'antd/locale/ru_RU';
import App from './App';
ReactDOM.createRoot(document.getElementById('root')).render(
  <ConfigProvider locale={ruRU} theme={{algorithm:theme.darkAlgorithm,token:{colorPrimary:'#1890ff'}}}>
    <App/>
  </ConfigProvider>
);
