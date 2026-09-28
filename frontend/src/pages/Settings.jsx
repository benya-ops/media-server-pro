import React,{useState,useEffect} from 'react';
import {Tabs,Form,Input,InputNumber,Switch,Button,message,Card,List,Modal,Select,Popconfirm} from 'antd';
import {PlusOutlined,DeleteOutlined,ThunderboltOutlined} from '@ant-design/icons';
import axios from 'axios';
export default function Settings(){
  const [settings,setSettings]=useState({});
  const [profiles,setProfiles]=useState([]);
  const [s3,setS3]=useState({});
  const [pModal,setPModal]=useState(false);
  const [editP,setEditP]=useState(null);
  const [form]=Form.useForm();
  const [pForm]=Form.useForm();
  const [s3Form]=Form.useForm();
  const load=async()=>{
    const[s,p,s3d]=await Promise.all([axios.get('/api/settings'),axios.get('/api/transcode/profiles'),axios.get('/api/s3')]);
    const o={};s.data.forEach(x=>o[x.key]=x.value);setSettings(o);setProfiles(p.data);setS3(s3d.data);
  };
  useEffect(()=>{load()},[]);
  const saveSettings=async(v)=>{
    const arr=Object.entries(v).map(([k,val])=>({key:k,value:String(val)}));
    await axios.put('/api/settings',arr);message.success('Saved');
  };
  const apply=async()=>{await axios.post('/api/apply');message.success('Applied to SRS')};
  const saveP=async(v)=>{
    if(editP) await axios.put('/api/transcode/profiles/'+editP.id,v);
    else await axios.post('/api/transcode/profiles',v);
    setPModal(false);load();
  };
  const delP=async(id)=>{await axios.delete('/api/transcode/profiles/'+id);load()};
  const saveS3=async(v)=>{await axios.put('/api/s3',v);message.success('S3 saved')};
  return(
    <div>
      <h2 style={{color:'#fff',marginBottom:16}}>Settings</h2>
      <Button type="primary" icon={<ThunderboltOutlined/>} onClick={apply} style={{marginBottom:16}}>Apply to SRS</Button>
      <Tabs defaultActiveKey="1" items={[
        {key:'1',label:'General',children:(
          <Card><Form form={form} initialValues={settings} onFinish={saveSettings} layout="vertical">
            <Form.Item name="max_streams" label="Max Streams"><InputNumber style={{width:'100%'}}/></Form.Item>
            <Form.Item name="rtmp_ports" label="RTMP Ports"><Input placeholder="1935,1936"/></Form.Item>
            <Form.Item name="webrtc_latency" label="WebRTC Latency (ms)"><InputNumber style={{width:'100%'}}/></Form.Item>
            <Button type="primary" htmlType="submit">Save</Button>
          </Form></Card>
        )},
        {key:'2',label:'Transcoding',children:(
          <Card>
            <Button type="primary" icon={<PlusOutlined/>} onClick={()=>{setEditP(null);pForm.resetFields();setPModal(true)}} style={{marginBottom:16}}>Add Profile</Button>
            <List dataSource={profiles} renderItem={p=>(
              <List.Item actions={[
                <Button onClick={()=>{setEditP(p);pForm.setFieldsValue(p);setPModal(true)}}>Edit</Button>,
                <Popconfirm title="Delete?" onConfirm={()=>delP(p.id)}><Button danger>Delete</Button></Popconfirm>
              ]}>
                <List.Item.Meta title={p.name+(p.use_gpu?' (GPU)':' (CPU)')} description={p.video_codec+' '+p.width+'x'+p.height+' '+p.bitrate+'kbps SCTE:'+p.scte35_mode}/>
              </List.Item>
            )}/>
          </Card>
        )},
        {key:'3',label:'S3 Storage',children:(
          <Card><Form form={s3Form} initialValues={s3} onFinish={saveS3} layout="vertical">
            <Form.Item name="enabled" label="Enable S3" valuePropName="checked"><Switch/></Form.Item>
            <Form.Item name="endpoint" label="Endpoint"><Input/></Form.Item>
            <Form.Item name="bucket" label="Bucket"><Input/></Form.Item>
            <Form.Item name="access_key" label="Access Key"><Input/></Form.Item>
            <Form.Item name="secret_key" label="Secret Key"><Input.Password/></Form.Item>
            <Form.Item name="region" label="Region"><Input/></Form.Item>
            <Button type="primary" htmlType="submit">Save S3</Button>
          </Form></Card>
        )}
      ]}/>
      <Modal title="Transcode Profile" open={pModal} onCancel={()=>setPModal(false)} footer={null} width={700}>
        <Form form={pForm} onFinish={saveP} layout="vertical" initialValues={{use_gpu:true,scte35_mode:'passthrough',enabled:true}}>
          <Form.Item name="name" label="Name" rules={[{required:true}]}><Input/></Form.Item>
          <Form.Item name="video_codec" label="Codec"><Select><Select.Option value="h264">H.264</Select.Option><Select.Option value="mpeg2video">MPEG-2</Select.Option></Select></Form.Item>
          <Form.Item name="width" label="Width"><InputNumber style={{width:'100%'}}/></Form.Item>
          <Form.Item name="height" label="Height"><InputNumber style={{width:'100%'}}/></Form.Item>
          <Form.Item name="bitrate" label="Bitrate (kbps)"><InputNumber style={{width:'100%'}}/></Form.Item>
          <Form.Item name="fps" label="FPS"><InputNumber style={{width:'100%'}}/></Form.Item>
          <Form.Item name="audio_codec" label="Audio Codec"><Input placeholder="aac"/></Form.Item>
          <Form.Item name="audio_bitrate" label="Audio Bitrate"><InputNumber style={{width:'100%'}}/></Form.Item>
          <Form.Item name="use_gpu" label="Use GPU" valuePropName="checked"><Switch/></Form.Item>
          <Form.Item name="scte35_mode" label="SCTE-35"><Select><Select.Option value="passthrough">Passthrough</Select.Option><Select.Option value="transcode">Transcode</Select.Option><Select.Option value="disabled">Disabled</Select.Option></Select></Form.Item>
          <Form.Item name="subtitles_enabled" label="Closed Captions" valuePropName="checked"><Switch/></Form.Item>
          <Form.Item name="enabled" label="Active" valuePropName="checked"><Switch/></Form.Item>
          <Button type="primary" htmlType="submit" block>Save</Button>
        </Form>
      </Modal>
    </div>
  );
}
