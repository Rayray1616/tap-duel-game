import { TonConnect } from "@tonconnect/sdk";

let tonConnectInstance = null;

export function getTonConnect() {
  if (!tonConnectInstance) {
    tonConnectInstance = new TonConnect({
      manifestUrl: "https://tap-duel-game-production.up.railway.app/tonconnect-manifest.json"
    });
  }
  return tonConnectInstance;
}
