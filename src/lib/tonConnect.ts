import { TonConnectUI } from "@tonconnect/ui";

let tonConnectUI: TonConnectUI | null = null;

export function initializeTonConnect() {
  if (tonConnectUI) {
    return tonConnectUI;
  }

  console.log("Initializing TON Connect for Mini App");
  
  tonConnectUI = new TonConnectUI({
    manifestUrl: "https://tap-duel-game-production.up.railway.app/tonconnect-manifest.json",
  });

  return tonConnectUI;
}

export async function ensureTonConnectInitialized() {
  if (!tonConnectUI) {
    tonConnectUI = initializeTonConnect();
  }
  
  console.log("Ensuring TON Connect is initialized");
  
  // Wait for TON Connect to be ready
  return new Promise<TonConnectUI>((resolve) => {
    if (tonConnectUI!.connected) {
      console.log("TON Connect already initialized");
      resolve(tonConnectUI!);
      return;
    }
    
    // Wait a bit for initialization
    setTimeout(() => {
      console.log("TON Connect initialization complete");
      resolve(tonConnectUI!);
    }, 100);
  });
}

export function getTonConnectUI() {
  return tonConnectUI;
}
