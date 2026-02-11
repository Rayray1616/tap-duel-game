# 🔥 Tap Duel - Telegram Mini App Game

An addictive 10-second tap-and-duel game built for Telegram Mini Apps. Players tap furiously for 10 seconds to rack up points, with energy limits that regenerate over time. Challenge opponents in real-time duels and climb the leaderboard!

## 🎮 Game Features

- **Core Gameplay**: 10-second tapping sessions with energy system
- **Real-time Duels**: Match with other players for live battles
- **Energy System**: Limited energy that regenerates over time (2 energy/minute)
- **Leaderboards**: Global rankings showing top players
- **Daily Rewards**: Claim daily bonuses with level multipliers
- **Upgrade System**: Purchase tap multipliers and energy boosts
- **Dark Neon Theme**: Futuristic cyan neon aesthetic with cyberpunk fonts

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Telegram Integration**: @tma.js/sdk-react for Mini App auth
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Styling**: Tailwind CSS + custom neon theme
- **Deployment**: Railway-ready configuration

## 📋 Database Schema

### Users Table
- `telegram_id`: Unique Telegram user ID
- `username`: Telegram username
- `score`: Total accumulated points
- `energy`: Current energy (max 100 + boosts)
- `level`: Player level (every 100 points)
- `tap_multiplier`: Tap power multiplier (1.0 - 1.5)
- `energy_boost`: Additional max energy (0 - 100)
- `daily_reward_claimed`: Daily reward status

### Duels Table
- `player1_id`, `player2_id`: Participant user IDs
- `start_time`, `end_time`: Duel timestamps
- `player1_taps`, `player2_taps`: Tap counts
- `winner_id`: Winning player ID
- `status`: waiting/active/completed

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Telegram Bot Token
- Supabase project (URL + Anon Key)

### Installation

1. **Clone and install dependencies**
```bash
git clone <your-repo>
cd tap-duel-game
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your credentials:
# SUPABASE_URL=your_supabase_url_here
# SUPABASE_ANON_KEY=your_supabase_anon_key_here
# TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

3. **Database Setup**
```bash
# Run the SQL setup script in Supabase SQL Editor:
# database/setup.sql
```

4. **Run Development Server**
```bash
npm run dev
# Visit http://localhost:5173
```

## 🎯 Game Mechanics

### Energy System
- Start with 100 energy
- Each solo game costs 10 energy
- Each duel costs 20 energy
- Regenerates 2 energy per minute
- Energy boosts increase max capacity

### Scoring
- 1 point per tap (multiplied by tap multiplier)
- Duel winners get +50 bonus points
- Level up every 100 points
- Daily rewards: 50 + (level × 10) points

### Upgrades
- **Tap Multiplier**: Increase taps per click (up to 1.5x)
- **Energy Boost**: Increase max energy capacity (+20 per level)
- **Energy Regeneration**: Faster recovery (planned feature)

## 🌐 Deployment

### Railway Deployment

1. **Connect Repository**
   - Create new Railway project
   - Connect your GitHub repository

2. **Environment Variables**
   - Set `SUPABASE_URL`
   - Set `SUPABASE_ANON_KEY`
   - Set `TELEGRAM_BOT_TOKEN`
   - Set `PORT=3000`

3. **Deploy Settings**
   - Build command: `npm run build`
   - Start command: `npm run railway:start`
   - Health check path: `/`

### Manual Deployment
```bash
npm run build
npm start
```

## 🎨 Theme & Styling

The game features a dark neon cyan theme:
- **Colors**: Black background with cyan (#00FFFF) accents
- **Fonts**: Orbitron (Google Fonts) for cyberpunk aesthetic
- **Effects**: Neon glows, pulse animations, hover states
- **Responsive**: Optimized for mobile Telegram view

## 🔧 Configuration

### Telegram Bot Setup
1. Create bot via @BotFather
2. Set up Mini App in BotFather
3. Configure web app URL
4. Add bot token to environment

### Supabase Setup
1. Create new Supabase project
2. Run `database/setup.sql` in SQL Editor
3. Enable Realtime on `users` and `duels` tables
4. Configure RLS policies (included in setup)

## 🧪 Testing

### Local Testing
```bash
npm run dev
# Opens with mock Telegram environment
```

### Mobile Testing
```bash
npm run dev:https
# Uses SSL for mobile Telegram testing
```

### Duel Testing
- Open two browser tabs
- Join duel simultaneously
- Test real-time tap updates

## 📱 Telegram Integration

The app integrates with Telegram Mini Apps using:
- **Authentication**: Telegram user data via initData
- **UI Adaptation**: Theme colors and platform detection
- **Navigation**: Hash-based routing for Mini App compatibility

## 🐛 Troubleshooting

### Common Issues

1. **"Not enough energy" error**
   - Wait for energy regeneration (2/min)
   - Claim daily rewards for +30 energy

2. **Realtime updates not working**
   - Check Supabase Realtime is enabled
   - Verify RLS policies allow subscriptions

3. **Telegram auth fails**
   - Ensure bot token is valid
   - Check Mini App URL configuration

4. **Build errors**
   - Run `npm install` to update dependencies
   - Check environment variables are set

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - feel free to use this code for your own projects!

## 🔗 Links

- [Telegram Mini Apps Docs](https://docs.telegram-mini-apps.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Railway Deployment](https://railway.app/)
- [@tma.js SDK](https://docs.telegram-mini-apps.com/packages/tma-js-sdk)

---

**Built with ❤️ for the Telegram gaming community!**
