import { Contract, ethers } from "ethers";
import dotenv from 'dotenv';
import Vault from "../abis/Vault.json";
import Reader from "../abis/Reader.json";
import { MARKETS, POSITION_PROPS_LENGTH, READER_CONTRACT_ADDRESS, SOLV_BTC_CONTRACT_ADDRESS, VAULT_CONTRACT_ADDRESS } from "../src/utils/utils";

dotenv.config();


const market = MARKETS["Crypto.XRP/USD"]
async function viewPositionData() {

    const RPC_URL = process.env.RPC_URL;
    const TRADER_PRIVATE_KEY = process.env.TRADER_PRIVATE_KEY || "";
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const traderWallet = new ethers.Wallet(TRADER_PRIVATE_KEY, provider);
    const signer = traderWallet.connect(provider)

    const vault = new Contract(
        ethers.utils.getAddress(VAULT_CONTRACT_ADDRESS),
        Vault.abi,
        signer
    )


    const longOpenInterest = await vault.longOpenInterest(market.index)
    const shortOpenInterest = await vault.longOpenInterest(market.index)

    const totalOpenInterestUsd = Number(longOpenInterest.add(shortOpenInterest)) * 10 ** -30
    console.log({
        totalOpenInterestUsd
    });
    
}
viewPositionData().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});