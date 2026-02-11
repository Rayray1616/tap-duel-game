# 🚀 Tap Duel - Deployment Guide

## Railway Deployment (Recommended)

### 1. Prepare Your Repository
```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "Tap Duel game ready for deployment"
git push origin main
```

### 2. Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub repository
4. Select the `tap-duel-game` repository

### 3. Configure Environment Variables
In Railway project settings, add these environment variables:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
PORT=3000
NODE_ENV=production
```

### 4. Deploy Settings
Railway will automatically detect the `railway.json` configuration:
- **Build Command**: `npm run build`
- **Start Command**: `npm run railway:start`
- **Health Check**: `/` path

### 5. Deploy and Test
1. Click "Deploy" 
2. Wait for deployment to complete
3. Test your live app at the provided Railway URL

## Telegram Bot Configuration

### 1. Create Telegram Bot
1. Message @BotFather on Telegram
2. `/newbot` → Create your bot
3. Save the bot token

### 2. Create Mini App
1. Message @BotFather again
2. `/newapp` → Create Mini App
3. Set the app URL to your Railway deployment URL
4. Configure the app name and description

### 3. Test in Telegram
1. Open your bot in Telegram
2. Click the Mini App button
3. Test all features: tapping, duels, rewards, upgrades

## Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Save project URL and anon key

### 2. Setup Database
1. Go to SQL Editor in Supabase
2. Run the `database/setup.sql` script
3. Verify tables are created

### 3. Enable Realtime
1. Go to Replication in Supabase
2. Enable Realtime for `users` and `duels` tables
3. Test real-time duels functionality

## Alternative Deployment Options

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify Deployment
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `TELEGRAM_BOT_TOKEN` | ✅ | Telegram bot token |
| `PORT` | ❌ | Server port (default: 3000) |
| `NODE_ENV` | ❌ | Environment (production/development) |

## Troubleshooting

### Build Issues
```bash
# Clear build cache
rm -rf dist node_modules
npm install
npm run build
```

### Environment Variable Issues
- Ensure all required variables are set
- Check Railway environment variable syntax
- Verify Supabase URL and keys are correct

### Realtime Issues
- Check Supabase Realtime is enabled
- Verify RLS policies allow subscriptions
- Test with multiple browser tabs

### Telegram Integration Issues
- Verify bot token is valid
- Check Mini App URL in BotFather
- Ensure HTTPS is used (Railway provides this)

## Performance Optimization

### Build Optimization
The build includes optimizations:
- Code splitting for better loading
- CSS and JS minification
- Asset optimization

### Database Optimization
- Indexes on frequently queried columns
- Realtime subscriptions only when needed
- Efficient query patterns

## Monitoring

### Railway Monitoring
- Built-in metrics and logs
- Error tracking
- Performance monitoring

### Supabase Monitoring
- Database performance metrics
- Realtime connection status
- API usage statistics

## Security Considerations

- Environment variables are secure in Railway
- RLS policies protect database access
- HTTPS enforced by Railway
- No sensitive data in client code

---

**Your Tap Duel game is now ready for production! 🎮**
