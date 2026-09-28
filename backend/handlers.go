package main

import (
	"os/exec"
	"github.com/gin-gonic/gin"
)

type Stream struct {
	ID string `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
	StreamID string `db:"stream_id" json:"stream_id"`
	SRTIn *int `db:"srt_ingest_port" json:"srt_ingest_port"`
	SRTOut *int `db:"srt_output_port" json:"srt_output_port"`
	Status string `db:"status" json:"status"`
	Encryption bool `db:"encryption" json:"encryption"`
	Passphrase string `db:"passphrase" json:"passphrase,omitempty"`
	AutoRestart bool `db:"auto_restart" json:"auto_restart"`
	Placeholder string `db:"placeholder_url" json:"placeholder_url"`
	DVR bool `db:"dvr_enabled" json:"dvr_enabled"`
	DVRHours int `db:"dvr_buffer_hours" json:"dvr_buffer_hours"`
	Record bool `db:"record_enabled" json:"record_enabled"`
}

func getStreams(c *gin.Context) {
	var s []Stream
	db.Select(&s, "SELECT * FROM streams ORDER BY created_at DESC")
	c.JSON(200, s)
}
func createStream(c *gin.Context) {
	var s Stream
	if e := c.ShouldBindJSON(&s); e != nil { c.JSON(400, gin.H{"error":e.Error()}); return }
	var id string
	db.QueryRow(`INSERT INTO streams(name,stream_id,srt_ingest_port,srt_output_port,encryption,passphrase,auto_restart,placeholder_url,dvr_enabled,dvr_buffer_hours,record_enabled) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
		s.Name,s.StreamID,s.SRTIn,s.SRTOut,s.Encryption,s.Passphrase,s.AutoRestart,s.Placeholder,s.DVR,s.DVRHours,s.Record).Scan(&id)
	s.ID = id; c.JSON(201, s)
}
func updateStream(c *gin.Context) {
	var s Stream; c.ShouldBindJSON(&s)
	db.Exec(`UPDATE streams SET name=$1,srt_ingest_port=$2,srt_output_port=$3,encryption=$4,passphrase=$5,auto_restart=$6,placeholder_url=$7,dvr_enabled=$8,dvr_buffer_hours=$9,record_enabled=$10 WHERE id=$11`,
		s.Name,s.SRTIn,s.SRTOut,s.Encryption,s.Passphrase,s.AutoRestart,s.Placeholder,s.DVR,s.DVRHours,s.Record,c.Param("id"))
	c.JSON(200, gin.H{"ok":true})
}
func deleteStream(c *gin.Context) {
	db.Exec("DELETE FROM streams WHERE id=$1", c.Param("id"))
	c.JSON(200, gin.H{"ok":true})
}

type KV struct { Key string `json:"key"`; Value string `json:"value"` }
func getSettings(c *gin.Context) {
	var s []KV; db.Select(&s, "SELECT key,value FROM settings"); c.JSON(200, s)
}
func updateSettings(c *gin.Context) {
	var r []KV; c.ShouldBindJSON(&r)
	for _, s := range r { db.Exec(`INSERT INTO settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=$2`, s.Key, s.Value) }
	c.JSON(200, gin.H{"ok":true})
}

type Profile struct {
	ID string `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
	VCodec string `db:"video_codec" json:"video_codec"`
	W int `db:"width" json:"width"`
	H int `db:"height" json:"height"`
	BR int `db:"bitrate" json:"bitrate"`
	FPS int `db:"fps" json:"fps"`
	ACodec string `db:"audio_codec" json:"audio_codec"`
	ABR int `db:"audio_bitrate" json:"audio_bitrate"`
	GPU bool `db:"use_gpu" json:"use_gpu"`
	SCTE string `db:"scte35_mode" json:"scte35_mode"`
	CC bool `db:"subtitles_enabled" json:"subtitles_enabled"`
	On bool `db:"enabled" json:"enabled"`
}
func getProfiles(c *gin.Context) {
	var p []Profile; db.Select(&p, "SELECT * FROM transcode_profiles"); c.JSON(200, p)
}
func createProfile(c *gin.Context) {
	var p Profile; c.ShouldBindJSON(&p); var id string
	db.QueryRow(`INSERT INTO transcode_profiles(name,video_codec,width,height,bitrate,fps,audio_codec,audio_bitrate,use_gpu,scte35_mode,subtitles_enabled,enabled) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
		p.Name,p.VCodec,p.W,p.H,p.BR,p.FPS,p.ACodec,p.ABR,p.GPU,p.SCTE,p.CC,p.On).Scan(&id)
	p.ID = id; c.JSON(201, p)
}
func updateProfile(c *gin.Context) {
	var p Profile; c.ShouldBindJSON(&p)
	db.Exec(`UPDATE transcode_profiles SET name=$1,video_codec=$2,width=$3,height=$4,bitrate=$5,fps=$6,audio_codec=$7,audio_bitrate=$8,use_gpu=$9,scte35_mode=$10,subtitles_enabled=$11,enabled=$12 WHERE id=$13`,
		p.Name,p.VCodec,p.W,p.H,p.BR,p.FPS,p.ACodec,p.ABR,p.GPU,p.SCTE,p.CC,p.On,c.Param("id"))
	c.JSON(200, gin.H{"ok":true})
}
func deleteProfile(c *gin.Context) {
	db.Exec("DELETE FROM transcode_profiles WHERE id=$1", c.Param("id")); c.JSON(200, gin.H{"ok":true})
}

type S3 struct {
	On bool `db:"enabled" json:"enabled"`
	EP string `db:"endpoint" json:"endpoint"`
	BK string `db:"bucket" json:"bucket"`
	AK string `db:"access_key" json:"access_key"`
	SK string `db:"secret_key" json:"secret_key"`
	RG string `db:"region" json:"region"`
}
func getS3(c *gin.Context) {
	var s S3
	db.QueryRow("SELECT enabled,endpoint,bucket,access_key,secret_key,region FROM s3_config WHERE id=1").Scan(&s.On,&s.EP,&s.BK,&s.AK,&s.SK,&s.RG)
	c.JSON(200, s)
}
func updateS3(c *gin.Context) {
	var s S3; c.ShouldBindJSON(&s)
	db.Exec("UPDATE s3_config SET enabled=$1,endpoint=$2,bucket=$3,access_key=$4,secret_key=$5,region=$6 WHERE id=1", s.On,s.EP,s.BK,s.AK,s.SK,s.RG)
	c.JSON(200, gin.H{"ok":true})
}

func applySRS(c *gin.Context) {
	exec.Command("curl","-s","-X","POST","http://srs:1985/api/v1/raw?rpc=reload").Run()
	c.JSON(200, gin.H{"message":"SRS reloaded"})
}
