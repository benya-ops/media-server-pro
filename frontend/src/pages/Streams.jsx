import React,{useState,useEffect} from 'react';
import {Table,Button,Modal,Form,Input,InputNumber,Switch,Tag,message,Popconfirm} from 'antd';
import {PlusOutlined,DeleteOutlined,EditOutlined} from '@ant-design/icons';
import axios from 'axios';
export default function Streams(){
  const [streams,setStreams]=useState([]);
  const [modal,setModal]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form]=Form.useForm();
  const load=async()=>{const{data}=await axios.get('/api/streams');setStreams(data)};
  useEffect(()=>{load();const i=setInterval(load,5000);return()=>clearInterval(i)},[]);
  const save=async(v)=>{
    if(editing){await axios.put('/api/streams/'+editing.id,v);message.success('Updated')}
    else{await axios.post('/api/streams',v);message.success('Created')}
    setModal(false);load();
  };
  const del=async(id)=>{await axios.delete('/api/streams/'+id);load()};
  const cols=[
    {title:'Name',dataIndex:'name'},
    {title:'Stream ID',dataIndex:'stream_id',render:v=><code>{v}</code>},
    {title:'SRT In',dataIndex:'srt_ingest_port',render:v=>v||'-'},
    {title:'SRT Out',dataIndex:'srt_output_port',render:v=>v||'-'},
    {title:'Status',dataIndex:'status',render:v=><Tag color={v==='online'?'green':'default'}>{v}</Tag>},
    {title:'DVR',dataIndex:'dvr_enabled',render:v=>v?'Y':'-'},
    {title:'Record',dataIndex:'record_enabled',render:v=>v?'Y':'-'},
    {title:'Actions',render:(_,r)=><>
      <Button icon={<EditOutlined/>} onClick={()=>{setEditing(r);form.setFieldsValue(r);setModal(true)}} style={{marginRight:8}}/>
      <Popconfirm title="Delete?" onConfirm={()=>del(r.id)}><Button danger icon={<DeleteOutlined/>}/></Popconfirm>
    </>}
  ];
  return(
    <div>
      <h2 style={{color:'#fff',marginBottom:16}}>Streams</h2>
      <Button type="primary" icon={<PlusOutlined/>} onClick={()=>{setEditing(null);form.resetFields();setModal(true)}} style={{marginBottom:16}}>New Stream</Button>
      <Table columns={cols} dataSource={streams} rowKey="id"/>
      <Modal title={editing?"Edit Stream":"New Stream"} open={modal} onCancel={()=>setModal(false)} footer={null} width={700}>
        <Form form={form} onFinish={save} layout="vertical" initialValues={{dvr_buffer_hours:2}}>
          <Form.Item name="name" label="Name" rules={[{required:true}]}><Input/></Form.Item>
          <Form.Item name="stream_id" label="Stream ID" rules={[{required:true}]}><Input placeholder="live/stream1"/></Form.Item>
          <Form.Item name="srt_ingest_port" label="SRT Ingest Port"><InputNumber style={{width:'100%'}}/></Form.Item>
          <Form.Item name="srt_output_port" label="SRT Output Port"><InputNumber style={{width:'100%'}}/></Form.Item>
          <Form.Item name="encryption" label="Encryption" valuePropName="checked"><Switch/></Form.Item>
          <Form.Item name="passphrase" label="Passphrase"><Input.Password/></Form.Item>
          <Form.Item name="auto_restart" label="Auto Restart" valuePropName="checked"><Switch/></Form.Item>
          <Form.Item name="dvr_enabled" label="DVR" valuePropName="checked"><Switch/></Form.Item>
          <Form.Item name="dvr_buffer_hours" label="DVR Buffer (hours)"><InputNumber style={{width:'100%'}} min={1} max={24}/></Form.Item>
          <Form.Item name="record_enabled" label="Record" valuePropName="checked"><Switch/></Form.Item>
          <Form.Item name="placeholder_url" label="Placeholder Image URL"><Input/></Form.Item>
          <Button type="primary" htmlType="submit" block>{editing?'Save':'Create'}</Button>
        </Form>
      </Modal>
    </div>
  );
}
