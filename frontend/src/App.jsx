import React from 'react';
import {BrowserRouter,Routes,Route,Link} from 'react-router-dom';
import {Layout,Menu} from 'antd';
import {SettingOutlined,VideoCameraOutlined,DashboardOutlined} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import Streams from './pages/Streams';
import Settings from './pages/Settings';
const {Sider,Content,Header}=Layout;
export default function App(){
  return(
    <BrowserRouter>
      <Layout style={{minHeight:'100vh'}}>
        <Sider theme="dark" width={250}>
          <div style={{padding:20,color:'#fff',fontSize:20,fontWeight:'bold',borderBottom:'1px solid #333'}}>
            Media Server Pro
          </div>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} style={{borderRight:0}}>
            <Menu.Item key="1" icon={<DashboardOutlined/>}><Link to="/">Dashboard</Link></Menu.Item>
            <Menu.Item key="2" icon={<VideoCameraOutlined/>}><Link to="/streams">Streams</Link></Menu.Item>
            <Menu.Item key="3" icon={<SettingOutlined/>}><Link to="/settings">Settings</Link></Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{background:'#1f1f1f',padding:'0 24px',color:'#fff'}}>Media Server Pro - Stage 1</Header>
          <Content style={{margin:24,padding:24,background:'#141414',borderRadius:8}}>
            <Routes>
              <Route path="/" element={<Dashboard/>}/>
              <Route path="/streams" element={<Streams/>}/>
              <Route path="/settings" element={<Settings/>}/>
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
}
