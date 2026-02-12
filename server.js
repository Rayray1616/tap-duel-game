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
app.post('/webhook', (req, res) => {
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

  // Basic /start handler for now
  const message = req.body.message;
  if (message && message.text === '/start') {
    // Later: send deep link / mini app URL here
    console.log('📲 /start received from', message.from?.id);
  }

  // Handle plain /start (no duel link)
  if (message && message.text === "/start") {
    const chatId = message.chat.id;

    // Note: You'll need to implement sendMessage function or use a Telegram bot library
    // This is a placeholder for the actual bot API call
    console.log('🎮 Plain /start received:', { chatId, from: message.from });
    
    // TODO: Implement actual Telegram bot API call
    await sendMessage(chatId, "Welcome to Tap Duel! Ready to battle?", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Play",
              web_app: {
                url: `https://tap-duel-game.railway.app/lobby/new` 
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
                url: `https://tap-duel-game.railway.app/lobby/${duelId}` 
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

function finishDuel(duelId) {
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
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Telegram webhook: POST /webhook`);
  console.log(`🏥 Health check: GET /health`);
  console.log(`🔌 WebSocket: ws://<host>/ (behind same server)`);
});

export default app;
