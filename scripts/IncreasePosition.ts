import { Contract, ethers } from "ethers";
import dotenv from 'dotenv';
import PositionRouter from "../abis/PositionRouter.json";
import Router from "../abis/Router.json";
import ERC20 from "../abis/ERC20.json";
import { fetchMarketPrice,  MARKETS, POSITION_ROUTER_CONTRACT_ADDRESS, SOLV_BTC_CONTRACT_ADDRESS, toUsd } from "../src/utils/utils";

dotenv.config();


const market = MARKETS["Crypto.XRP/USD"]
async function increasePosition() {

    const RPC_URL = process.env.RPC_URL;
    const TRADER_PRIVATE_KEY = process.env.TRADER_PRIVATE_KEY || "";
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const traderWallet = new ethers.Wallet(TRADER_PRIVATE_KEY, provider);
    const signer = traderWallet.connect(provider)

    const positionRouter = new Contract(
        ethers.utils.getAddress(POSITION_ROUTER_CONTRACT_ADDRESS),
        PositionRouter.abi,
        signer
    )

    const router = new Contract(
        await positionRouter.router(),
        Router.abi,
        signer
    )

    const solvBTC = new Contract(
        ethers.utils.getAddress(SOLV_BTC_CONTRACT_ADDRESS),
        ERC20.abi,
        signer
    )

    const decimals = 18 // SolvBTC.Core decimals
    const collateralAmount = ethers.utils.parseUnits("3", decimals - 4)//(0.0003 BTC)
    const approveTx = await solvBTC.approve(router.address, collateralAmount, {
        maxPriorityFeePerGas: ethers.utils.parseUnits("30", "gwei"),
        maxFeePerGas: ethers.utils.parseUnits("30", "gwei"),
    });
    await approveTx.wait();

    const executionFee = ethers.utils.parseUnits("1", 17)//(0.1 core)


    const pythPrice = await fetchMarketPrice(market.priceFeedId)



    const isApproved = await router.approvedPlugins(signer.address, positionRouter.address);
    if (!isApproved) {
        const approvePluginTx = await router.approvePlugin(positionRouter.address, {
            maxPriorityFeePerGas: ethers.utils.parseUnits("30", "gwei"),
            maxFeePerGas: ethers.utils.parseUnits("30", "gwei"),
        })
        await approvePluginTx.wait();
    }

    // const acceptablePrice =  toUsd(pythPrice.currentPrice + pythPrice.confidence) // LONG
    // const isLong = true;
    const acceptablePrice =  toUsd(pythPrice.currentPrice - pythPrice.confidence) // SHORT
    const isLong = false;

    const callStaticTx = await positionRouter.callStatic.createIncreasePosition(
        [solvBTC.address],// _path,
        market.index,// _indexToken,
        collateralAmount, // _amountIn ,
        0,// _minOut,
        toUsd(50), // _sizeDelta,
        isLong,// _isLong,
        acceptablePrice,// _acceptablePrice,
        executionFee,// _executionFee (0.1 core),
        ethers.constants.HashZero,// _referralCode,
        ethers.constants.AddressZero,// _callbackTarget
        {
            value: executionFee,
            maxPriorityFeePerGas: ethers.utils.parseUnits("30", "gwei"),
            maxFeePerGas: ethers.utils.parseUnits("30", "gwei"),
        }
    )

    console.log("new order key: ", callStaticTx);

    const tx = await positionRouter.createIncreasePosition(
        [solvBTC.address],// _path,
        market.index,// _indexToken,
        collateralAmount, // _amountIn ,
        0,// _minOut,
        toUsd(50), // _sizeDelta,
        isLong,// _isLong,
        acceptablePrice,// _acceptablePrice,
        executionFee,// _executionFee (0.1 core),
        ethers.constants.HashZero,// _referralCode,
        ethers.constants.AddressZero,// _callbackTarget
        {
            value: executionFee,
            maxPriorityFeePerGas: ethers.utils.parseUnits("30", "gwei"),
            maxFeePerGas: ethers.utils.parseUnits("30", "gwei"),
        }
    )

    await tx.wait();

    console.log(`Hash: ${tx.hash}`);
}
increasePosition().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});