CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    stream_id VARCHAR(255) NOT NULL UNIQUE,
    srt_ingest_port INT,
    srt_output_port INT,
    status VARCHAR(50) DEFAULT 'offline',
    encryption BOOLEAN DEFAULT false,
    passphrase TEXT,
    auto_restart BOOLEAN DEFAULT false,
    placeholder_url TEXT,
    dvr_enabled BOOLEAN DEFAULT false,
    dvr_buffer_hours INT DEFAULT 2,
    record_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transcode_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    video_codec VARCHAR(50) NOT NULL,
    width INT, height INT, bitrate INT, fps INT,
    audio_codec VARCHAR(50), audio_bitrate INT,
    use_gpu BOOLEAN DEFAULT false,
    scte35_mode VARCHAR(50) DEFAULT 'passthrough',
    subtitles_enabled BOOLEAN DEFAULT false,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS s3_config (
    id INT PRIMARY KEY DEFAULT 1,
    enabled BOOLEAN DEFAULT false,
    endpoint TEXT, bucket TEXT,
    access_key TEXT, secret_key TEXT,
    region TEXT DEFAULT 'us-east-1'
);

INSERT INTO settings (key, value) VALUES
    ('max_streams','25'),('rtmp_ports','1935'),
    ('webrtc_latency','200'),('theme','dark'),('language','ru')
ON CONFLICT (key) DO NOTHING;

INSERT INTO transcode_profiles (name,video_codec,width,height,bitrate,fps,audio_codec,audio_bitrate,use_gpu,scte35_mode,subtitles_enabled) VALUES
    ('H.264 1080p GPU','h264',1920,1080,4000,30,'aac',128,true,'passthrough',true),
    ('H.264 720p GPU','h264',1280,720,2000,30,'aac',128,true,'transcode',true),
    ('H.264 480p GPU','h264',854,480,1000,30,'aac',96,true,'passthrough',false),
    ('MPEG-2 SD CPU','mpeg2video',720,576,2000,25,'mp2',192,false,'passthrough',false),
    ('MPEG-2 HD CPU','mpeg2video',1920,1080,8000,25,'mp2',192,false,'passthrough',false);

INSERT INTO s3_config (enabled,endpoint,bucket,access_key,secret_key) VALUES (false,'','','','');
