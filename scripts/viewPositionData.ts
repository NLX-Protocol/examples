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
    const reader = new Contract(
        ethers.utils.getAddress(READER_CONTRACT_ADDRESS),
        Reader.abi,
        signer
    )
    const account = signer.address;
    const collateralTokenAddress = SOLV_BTC_CONTRACT_ADDRESS;
    const indexTokenAddress = market.index;


    const decimals = 18 // SolvBTC.Core decimals

    // Fetch using the vault contract
    const position = await vault.getPosition(account, collateralTokenAddress, indexTokenAddress, true);
    console.log({
        account,
        collateralTokenAddress,
        indexTokenAddress,
        size: Number(position[0]) * 10 ** -30,
        collateral: Number(position[1]) * 10 ** -30,
        averagePrice: Number(position[2]) * 10 ** -30,
        entryFundingRate: position[3].toLocaleString(),
        reserveAmount: Number(position[4]) * 10 ** -decimals,
        realizedPnl: Number(position[5]) * 10 ** -30,
        hasRealisedProfit: position[6].toLocaleString(),
        lastIncreasedTime: position[7].toLocaleString(),
    });

    // Fetch using a more detailed reader contract

    const collateralTokens = [
        SOLV_BTC_CONTRACT_ADDRESS,
        SOLV_BTC_CONTRACT_ADDRESS,
        // Add more collateral token addresses here...
    ]
    const indexTokens = [
        market.index,
        market.index,
        // Add more index token addresses here...
    ]
    const isLong = [
        true,
        false,
    ]

    if (!(collateralTokens.length === indexTokens.length && collateralTokens.length === isLong.length)) {
        throw new Error("Collateral tokens, index tokens, and isLong arrays must have the same length.");
    }

    const positions = await reader.getPositions(VAULT_CONTRACT_ADDRESS, account, collateralTokens, indexTokens, isLong)
    for (let i = 0; i < collateralTokens.length; i++) {
        console.log({
            account,
            collateralTokenAddress: collateralTokens[i],
            indexTokenAddress: indexTokens[i],
            size: Number(positions[i * POSITION_PROPS_LENGTH]) * 10 ** -30,
            collateral: Number(positions[i * POSITION_PROPS_LENGTH + 1]) * 10 ** -30,
            averagePrice: Number(positions[i * POSITION_PROPS_LENGTH + 2]) * 10 ** -30,
            entryFundingRate: positions[i * POSITION_PROPS_LENGTH + 3].toLocaleString(),
            hasRealizedProfit: Number(positions[i * POSITION_PROPS_LENGTH + 4]) === 1 ? true : false,
            realisedPnl: Number(positions[i * POSITION_PROPS_LENGTH + 5]) * 10 ** -30,
            lastIncreasedTime: positions[i * POSITION_PROPS_LENGTH + 6].toLocaleString(),
            hasProfit: Number(positions[i * POSITION_PROPS_LENGTH + 7]) === 1 ? true : false,
            pnl: Number(positions[i * POSITION_PROPS_LENGTH + 8]) * 10 ** -30 ,
        });
    }

}
viewPositionData().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});