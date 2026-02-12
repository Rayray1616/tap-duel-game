import { mnemonicNew, mnemonicToPrivateKey } from "@ton/crypto";
import { WalletContractV4 } from "ton";
import { TonClient } from "ton";

async function main() {
  const mnemonics = await mnemonicNew();
  console.log("MNEMONIC:", mnemonics.join(" "));

  const keyPair = await mnemonicToPrivateKey(mnemonics);
  const wallet = WalletContractV4.create({
    publicKey: keyPair.publicKey,
    workchain: 0
  });

  console.log("WALLET ADDRESS:", wallet.address.toString());
}

main();
