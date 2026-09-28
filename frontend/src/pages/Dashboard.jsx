import React,{useState,useEffect} from 'react';
import {Card,Row,Col,Statistic,Progress} from 'antd';
import {VideoCameraOutlined,CloudServerOutlined} from '@ant-design/icons';
import axios from 'axios';
export default function Dashboard(){
  const [streams,setStreams]=useState([]);
  useEffect(()=>{axios.get('/api/streams').then(r=>setStreams(r.data)).catch(()=>{})},[]);
  return(
    <div>
      <h2 style={{color:'#fff',marginBottom:24}}>Dashboard</h2>
      <Row gutter={[16,16]}>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Active" value={streams.filter(s=>s.status==='online').length} prefix={<VideoCameraOutlined/>} valueStyle={{color:'#3f8600'}}/></Card></Col>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Total Streams" value={streams.length}/></Card></Col>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Bitrate" value="---" suffix="Mbps"/></Card></Col>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Uptime" value="---" prefix={<CloudServerOutlined/>}/></Card></Col>
      </Row>
      <Row gutter={[16,16]} style={{marginTop:24}}>
        <Col xs={24} md={12}><Card title="CPU"><Progress percent={0} status="active"/></Card></Col>
        <Col xs={24} md={12}><Card title="GPU"><Progress percent={0} status="active"/></Card></Col>
      </Row>
    </div>
  );
}
