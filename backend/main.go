package main

import (
	"log"
	"os"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

var db *sqlx.DB

func main() {
	var err error
	db, err = sqlx.Connect("postgres", os.Getenv("DATABASE_URL"))
	if err != nil { log.Fatal("DB:", err) }
	defer db.Close()
	r := gin.Default()
	r.Use(cors())
	r.GET("/api/streams", getStreams)
	r.POST("/api/streams", createStream)
	r.PUT("/api/streams/:id", updateStream)
	r.DELETE("/api/streams/:id", deleteStream)
	r.GET("/api/settings", getSettings)
	r.PUT("/api/settings", updateSettings)
	r.GET("/api/transcode/profiles", getProfiles)
	r.POST("/api/transcode/profiles", createProfile)
	r.PUT("/api/transcode/profiles/:id", updateProfile)
	r.DELETE("/api/transcode/profiles/:id", deleteProfile)
	r.GET("/api/s3", getS3)
	r.PUT("/api/s3", updateS3)
	r.POST("/api/apply", applySRS)
	log.Println("Running on :8000")
	r.Run(":8000")
}

func cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type,Authorization")
		if c.Request.Method == "OPTIONS" { c.AbortWithStatus(204); return }
		c.Next()
	}
}
