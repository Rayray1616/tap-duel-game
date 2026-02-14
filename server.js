import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { WebSocketServer } from 'ws';
import TelegramBot from "node-telegram-bot-api";
import { TonClient, HttpApi } from "ton";
import { Address } from "ton-core";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { WalletContractV4, internal } from "ton";
import { createClient } from '@supabase/supabase-js';

// Supabase client will be initialized after environment variables are available
let supabase = null;

function initializeSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabase;
}

async function updatePlayerStats(winnerWallet, loserWallet, amountNanoTon) {
  try {
    const client = initializeSupabase();
    await client
      .from('player_stats')
      .upsert({
        wallet_address: winnerWallet,
        wins: 1,
        ton_won: amountNanoTon
      }, { onConflict: 'wallet_address' });

    await client
      .from('player_stats')
      .upsert({
        wallet_address: loserWallet,
        losses: 1,
        ton_lost: amountNanoTon
      }, { onConflict: 'wallet_address' });

    console.log("📊 Stats updated:", { winnerWallet, loserWallet });
  } catch (err) {
    console.error("❌ Supabase stats update error:", err);
  }
}

// Environment variable validation
const requiredEnvVars = ['BOT_TOKEN', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  console.error('Please set these variables in Railway environment settings');
  process.exit(1);
}

// Initialize Supabase client now that environment variables are available
initializeSupabase();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });

async function sendMessage(chatId, text, options = {}) {
  try {
    return await bot.sendMessage(chatId, text, options);
  } catch (err) {
    console.error("Telegram sendMessage error:", err);
  }
}

// TON client (mainnet)
const tonClient = new TonClient({
  endpoint: "https://toncenter.com/api/v2/jsonRPC",
  apiKey: process.env.TONCENTER_API_KEY || undefined
});

// Helper: send TON
async function sendTon(toAddress, amountNano) {
  const { wallet, keyPair } = await hotWalletPromise;

  const seqno = await tonClient.getWalletSeqno(wallet.address);

  const transfer = wallet.createTransfer({
    seqno,
    secretKey: keyPair.secretKey,
    messages: [
      internal({
        to: Address.parse(toAddress),
        value: amountNano,
        bounce: false
      })
    ]
  });

  await tonClient.sendExternalMessage(wallet, transfer);
  return true;
}

async function getTonBalance(address) {
  try {
    const result = await tonClient.getBalance(Address.parse(address));
    return result; // in nanoTON
  } catch (err) {
    console.error("TON balance error:", err);
    return null;
  }
}

async function loadHotWallet() {
  const mnemonic = process.env.TON_WALLET_MNEMONIC;
  if (!mnemonic) {
    console.error("Missing TON_WALLET_MNEMONIC");
    return null;
  }

  const words = mnemonic.split(" ");
  const keyPair = await mnemonicToPrivateKey(words);

  const wallet = WalletContractV4.create({
    publicKey: keyPair.publicKey,
    workchain: 0
  });

  return { wallet, keyPair };
}

const hotWalletPromise = loadHotWallet();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// --- In-memory real-time duel state ---
const duels = new Map(); // duelId -> { players: Map<playerId, ws>, taps: Map<playerId, number>, state, createdAt }

const DUEL_STATES = {
  WAITING: 'waiting',
  COUNTDOWN: 'countdown',
  ACTIVE: 'active',
  FINISHED: 'finished',
};

// --- Express middleware ---
app.use(cors());
app.use(express.json());

// Log all incoming HTTP requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    headers: req.headers,
    body: req.body,
    query: req.query,
  });
  next();
});

// Telegram Webhook Route
app.post('/webhook', async (req, res) => {
  console.log('🤖 Telegram Webhook Received:', {
    update_id: req.body.update_id,
    message: req.body.message ? {
      from: req.body.message.from,
      chat: req.body.message.chat,
      text: req.body.message.text,
    } : null,
    callback_query: req.body.callback_query ? {
      from: req.body.callback_query.from,
      data: req.body.callback_query.data,
    } : null,
  });

  // Handle /start command
  const message = req.body.message;
  if (message && message.text === '/start') {
    const chatId = message.chat.id;
    console.log('📲 /start received from', message.from?.id);
    
    await sendMessage(chatId, "Welcome to Tap Duel! Challenge your friends to epic tapping battles!", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Play Tap Duel",
              web_app: {
                url: "https://tap-duel-game-production.up.railway.app/?v=2"
              }
            }
          ]
        ]
      }
    });

    return res.status(200).send('OK');
  }

  // Handle deep link duel start
  if (message && message.text.startsWith("/start duel_")) {
    const duelId = message.text.replace("/start duel_", "");
    const chatId = message.chat.id;

    // Note: You'll need to implement sendMessage function or use a Telegram bot library
    // This is a placeholder for the actual bot API call
    console.log('🎯 Duel challenge received:', { duelId, chatId, from: message.from });
    
    // TODO: Implement actual Telegram bot API call
    await sendMessage(chatId, "A friend challenged you to a duel!", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Join Duel",
              web_app: {
                url: `https://tap-duel-game-production.up.railway.app/lobby/${duelId}?v=2`
              }
            }
          ]
        ]
      }
    });

    return res.status(200).send('OK');
  }

  res.status(200).send('OK');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    webhook: '/webhook',
  });
});

// TON stake validation endpoint
app.get("/api/ton/validate-stake", async (req, res) => {
  const { address, stake } = req.query;

  if (!address || !stake) {
    return res.status(400).json({ valid: false, reason: "Missing parameters" });
  }

  const stakeNano = Math.floor(parseFloat(stake) * 1e9);
  if (stakeNano <= 0) {
    return res.json({ valid: false, reason: "Stake must be greater than zero" });
  }

  const balance = await getTonBalance(address);
  if (!balance) {
    return res.json({ valid: false, reason: "Unable to fetch balance" });
  }

  if (balance < stakeNano) {
    return res.json({ valid: false, reason: "Insufficient TON balance" });
  }

  return res.json({ valid: true });
});

// Serve static files (React app)
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- HTTP server + WebSocket server ---
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcastToDuel(duelId, payload) {
  const duel = duels.get(duelId);
  if (!duel) return;
  for (const ws of duel.players.values()) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }
}

function startCountdown(duelId) {
  const duel = duels.get(duelId);
  if (!duel || duel.state !== DUEL_STATES.WAITING) return;

  duel.state = DUEL_STATES.COUNTDOWN;
  let counter = 3;

  const interval = setInterval(() => {
    if (!duels.has(duelId)) {
      clearInterval(interval);
      return;
    }

    if (counter > 0) {
      broadcastToDuel(duelId, { type: 'countdown', value: counter });
      counter -= 1;
    } else {
      clearInterval(interval);
      duel.state = DUEL_STATES.ACTIVE;
      duel.taps = new Map(
        Array.from(duel.players.keys()).map((playerId) => [playerId, 0]),
      );
      broadcastToDuel(duelId, { type: 'start' });

      // Optional: hard limit duration
      setTimeout(() => finishDuel(duelId), 5000); // 5s duel
    }
  }, 1000);
}

async function finishDuel(duelId) {
  const duel = duels.get(duelId);
  if (!duel || duel.state !== DUEL_STATES.ACTIVE) return;

  duel.state = DUEL_STATES.FINISHED;

  const entries = Array.from(duel.taps.entries());
  entries.sort((a, b) => b[1] - a[1]); // desc by taps

  const [winner, winnerTaps] = entries[0] || [null, 0];
  const [second, secondTaps] = entries[1] || [null, 0];

  // Calculate payout + fee
  const stake = duel.stakeTon;
  const feeTon = stake * 0.10;
  const payoutTon = stake * 0.90;

  const feeNano = Math.floor(feeTon * 1e9);
  const payoutNano = Math.floor(payoutTon * 1e9);

  console.log("Stake:", stake, "Payout:", payoutTon, "Fee:", feeTon);

  // Store these values on the duel object
  duel.feeNano = feeNano;
  duel.payoutNano = payoutNano;

  // TON payout execution
  if (duel.payoutNano > 0 && duel.feeNano >= 0) {
    if (duel.paid) {
      console.log("Payout already completed for duel:", duel.id);
      return;
    }

    // Wallet safety checks
    const winnerWallet = duel[winner + "Wallet"];

    if (!winnerWallet) {
      console.error("No winner wallet found for duel:", duel.id);
      return;
    }

    if (typeof winnerWallet !== "string" || !winnerWallet.startsWith("E") && !winnerWallet.startsWith("UQ")) {
      console.error("Invalid TON wallet address:", winnerWallet);
      return;
    }

    // Stake safety checks
    if (!duel.stakeTon || typeof duel.stakeTon !== "number" || isNaN(duel.stakeTon)) {
      console.error("Invalid stakeTon value for duel:", duel.id, duel.stakeTon);
      return;
    }

    if (duel.stakeTon <= 0) {
      console.error("Stake must be greater than zero for duel:", duel.id);
      return;
    }

    if (duel.stakeTon > 1000) {
      console.error("Stake exceeds maximum allowed limit for duel:", duel.id);
      return;
    }

    const houseWallet = "UQAmfGJTJlgcQKrUn6t2dPjGpVCX-6OsoTqdMPz7GNB9DnNU";

    console.log("TON payout starting...");
    console.log("Winner:", winnerWallet, "Payout:", duel.payoutNano);
    console.log("House:", houseWallet, "Fee:", duel.feeNano);

    try {
      console.log("Payout starting for duel:", duel.id);

      // Winner payout
      await sendTon(winnerWallet, duel.payoutNano);
      console.log("Winner payout successful:", {
        duelId: duel.id,
        wallet: winnerWallet,
        amount: duel.payoutNano,
        timestamp: Date.now()
      });

      // House fee payout (only after winner payout succeeds)
      await sendTon(houseWallet, duel.feeNano);
      console.log("House fee transfer successful:", {
        duelId: duel.id,
        wallet: houseWallet,
        amount: duel.feeNano,
        timestamp: Date.now()
      });

      duel.paid = true;
// --- Supabase stats update ---
try {
  const winnerWallet = duel[winner + "Wallet"];
  const loserWallet = duel[second + "Wallet"];

  if (winnerWallet && loserWallet) {
    await updatePlayerStats(winnerWallet, loserWallet, duel.payoutNano);
  } else {
    console.error("Missing winner or loser wallet for stats update");
  }
} catch (err) {
  console.error("Stats update failed:", err);
}

    } catch (err) {
      console.error("TON payout error:", {
        duelId: duel.id,
        winnerWallet,
        payout: duel.payoutNano,
        fee: duel.feeNano,
        error: err.message,
        timestamp: Date.now()
      });

      return; // Do NOT mark duel as paid
    }
  }

  broadcastToDuel(duelId, {
    type: 'result',
    winner,
    winnerTaps,
    second,
    secondTaps,
  });

  console.log('🏁 Duel finished', {
    duelId,
    taps: Object.fromEntries(duel.taps),
    winner,
    winnerTaps,
    second,
    secondTaps,
    feeNano,
    payoutNano,
  });

  // Keep in memory for a bit or clean up immediately
  setTimeout(() => {
    duels.delete(duelId);
  }, 10000);
}

wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');

  let currentDuelId = null;
  let currentPlayerId = null;

  ws.on('message', (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      console.log('⚠️ Invalid JSON from client');
      return;
    }

    const { type } = msg;

    if (type === 'join') {
      const { duelId, playerId } = msg;
      if (!duelId || !playerId) return;

      currentDuelId = duelId;
      currentPlayerId = playerId;

      let duel = duels.get(duelId);
      if (!duel) {
        duel = {
          players: new Map(),
          taps: new Map(),
          state: DUEL_STATES.WAITING,
          createdAt: Date.now(),
        };
        duels.set(duelId, duel);
      }

      duel.players.set(playerId, ws);

      console.log('👥 Player joined duel', { duelId, playerId, players: duel.players.size });

      broadcastToDuel(duelId, {
        type: 'players',
        players: Array.from(duel.players.keys()),
        state: duel.state,
      });

      if (duel.players.size === 2 && duel.state === DUEL_STATES.WAITING) {
        startCountdown(duelId);
      }
    }

    if (type === 'tap') {
      const { duelId, playerId } = msg;
      if (!duelId || !playerId) return;

      const duel = duels.get(duelId);
      if (!duel || duel.state !== DUEL_STATES.ACTIVE) return;

      const current = duel.taps.get(playerId) || 0;
      const next = current + 1;
      duel.taps.set(playerId, next);

      broadcastToDuel(duelId, {
        type: 'tap_update',
        playerId,
        taps: next,
      });
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
    if (!currentDuelId || !currentPlayerId) return;

    const duel = duels.get(currentDuelId);
    if (!duel) return;

    duel.players.delete(currentPlayerId);

    broadcastToDuel(currentDuelId, {
      type: 'players',
      players: Array.from(duel.players.keys()),
      state: duel.state,
    });

    if (duel.players.size === 0) {
      duels.delete(currentDuelId);
    }
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Telegram webhook: POST /webhook`);
  console.log(`🏥 Health check: GET /health`);
  console.log(`🔌 WebSocket: ws://<host>/ (behind same server)`);
});

export default app;
