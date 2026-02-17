// supabase.ts
import { createClient } from '@supabase/supabase-js';

// Use Vite's correct way to access client-exposed env vars
// ONLY vars prefixed with VITE_ are available in the browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Better error handling with clear instructions
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '%c[Supabase Error] Missing environment variables!',
    'color: red; font-weight: bold; font-size: 16px;'
  );
  console.error(
    'Please make sure your .env.local file (in the project root) contains:\n' +
    'VITE_SUPABASE_URL=https://vgsnxczxnrxuorfgtlgx.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=sb_publishable_FOi7EsAeShTCDLXtXayP_g_GrTcDm6Y\n\n' +
    'After editing .env.local, restart the dev server:\n' +
    '1. Ctrl+C in terminal to stop\n' +
    '2. Run: npm run dev\n\n' +
    'If the file is correct, check that it has no typos, no quotes around values, and no extra spaces.'
  );

  // You can keep throwing if you want the app to crash visibly:
  // throw new Error('Missing Supabase environment variables - see console for details');
}

// Create the client with your realtime tuning
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Keep the Database type export (it's excellent for type safety)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          telegram_id: string;
          username: string;
          score: number;
          energy: number;
          level: number;
          tap_multiplier: number;
          energy_boost: number;
          last_energy_regen: string;
          daily_reward_claimed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          telegram_id: string;
          username: string;
          score?: number;
          energy?: number;
          level?: number;
          tap_multiplier?: number;
          energy_boost?: number;
          last_energy_regen?: string;
          daily_reward_claimed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          telegram_id?: string;
          username?: string;
          score?: number;
          energy?: number;
          level?: number;
          tap_multiplier?: number;
          energy_boost?: number;
          last_energy_regen?: string;
          daily_reward_claimed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      duels: {
        Row: {
          id: string;
          player1_id: string;
          player2_id: string;
          start_time: string;
          end_time: string;
          player1_taps: number;
          player2_taps: number;
          winner_id: string;
          status: 'waiting' | 'active' | 'completed';
          created_at: string;
        };
        Insert: {
          id?: string;
          player1_id: string;
          player2_id: string;
          start_time?: string;
          end_time?: string;
          player1_taps?: number;
          player2_taps?: number;
          winner_id?: string;
          status?: 'waiting' | 'active' | 'completed';
          created_at?: string;
        };
        Update: {
          id?: string;
          player1_id?: string;
          player2_id?: string;
          start_time?: string;
          end_time?: string;
          player1_taps?: number;
          player2_taps?: number;
          winner_id?: string;
          status?: 'waiting' | 'active' | 'completed';
          created_at?: string;
        };
      };
      player_progression: {
        Row: {
          user_id: string;
          xp: number;
          level: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          xp?: number;
          level?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          xp?: number;
          level?: number;
          updated_at?: string;
        };
      };
      leaderboard: {
        Row: {
          user_id: string;
          username: string;
          level: number;
          xp: number;
          wins: number;
          losses: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          username: string;
          level?: number;
          xp?: number;
          wins?: number;
          losses?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          username?: string;
          level?: number;
          xp?: number;
          wins?: number;
          losses?: number;
          updated_at?: string;
        };
      };
      player_rewards: {
        Row: {
          user_id: string;
          last_claimed: string | null;
          streak: number;
          total_claims: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          last_claimed?: string | null;
          streak?: number;
          total_claims?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          last_claimed?: string | null;
          streak?: number;
          total_claims?: number;
          updated_at?: string;
        };
      };
      player_wallets: {
        Row: {
          user_id: string;
          ton_address: string | null;
          connected: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          ton_address?: string | null;
          connected?: boolean;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          ton_address?: string | null;
          connected?: boolean;
          updated_at?: string;
        };
      };
      player_gems: {
        Row: {
          user_id: string;
          gems: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          gems?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          gems?: number;
          updated_at?: string;
        };
      };
    };
  };
};

// Optional: Confirm in console that it worked (remove later if you want quiet)
console.log('Supabase client ready – URL and key loaded successfully');