# Telegram Bot Webhook Configuration

## Webhook Route
- **Path:** `POST /webhook`
- **Response:** `200 OK` (immediate)
- **Logging:** Full request details logged to console

## Server Configuration
- **Port:** `PORT` environment variable or 3000
- **Static Files:** Serves React app from `/dist`
- **Health Check:** `GET /health`

## Railway Deployment
The server will automatically:
1. Build the React app (`npm run build`)
2. Start Express server (`node server.js`)
3. Expose webhook at `/webhook`
4. Log all incoming Telegram updates

## Testing Webhook
```bash
# Health check
curl https://your-app.railway.app/health

# Test webhook (example payload)
curl -X POST https://your-app.railway.app/webhook \
  -H "Content-Type: application/json" \
  -d '{"update_id":123,"message":{"message_id":1,"from":{"id":123,"first_name":"Test"},"chat":{"id":123,"type":"private"},"text":"test"}}'
```
