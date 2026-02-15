import { TonConnect } from "@tonconnect/sdk";

let tonConnect: TonConnect | null = null;

export function initializeTonConnect() {
  if (tonConnect) {
    return tonConnect;
  }

  console.log("Initializing TON Connect for Mini App");
  
  tonConnect = new TonConnect({
    manifestUrl: "https://tap-duel-game-production.up.railway.app/tonconnect-manifest.json",
  });

  return tonConnect;
}

export async function ensureTonConnectInitialized() {
  if (!tonConnect) {
    tonConnect = initializeTonConnect();
  }
  
  console.log("Ensuring TON Connect is initialized");
  
  // Wait for TON Connect to be ready
  return new Promise<TonConnect>((resolve) => {
    if (tonConnect!.connected) {
      console.log("TON Connect already initialized");
      resolve(tonConnect!);
      return;
    }
    
    // Wait a bit for initialization
    setTimeout(() => {
      console.log("TON Connect initialization complete");
      resolve(tonConnect!);
    }, 100);
  });
}

export function getTonConnect() {
  return tonConnect;
}
