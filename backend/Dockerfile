FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod ./
RUN go mod download || true
COPY . .
RUN CGO_ENABLED=0 go build -o main .
FROM alpine:latest
RUN apk add --no-cache ca-certificates curl
WORKDIR /app
COPY --from=builder /app/main .
EXPOSE 8000
CMD ["./main"]
