import { ethers } from "ethers";

const { AddressZero } = ethers.constants;

interface PriceData {
    id: string;
    price: {
        price: string;
        conf: string;
        expo: number;
        publishTime: number;
    };
    ema_price: {
        price: string;
        conf: string;
        expo: number;
        publishTime: number;
    };
    vaa: string;
}

interface MarketPrice {
    currentPrice: number;
    confidence: number;
    emaPrice: number;
    lastUpdated: string;
    priceFeedId: string;
}

export const READER_CONTRACT_ADDRESS = "0xF8c3435Aa7334eeD367C3Df75eE69a037a5783c8"
export const VAULT_CONTRACT_ADDRESS = "0x736Cad071Fdb5ce7B17F35bB22f68Ad53F55C207"
export const POSITION_ROUTER_CONTRACT_ADDRESS = "0x6EdF4C4b15A53682E0461517C7c4C45405e4e9b3"
export const SOLV_BTC_CONTRACT_ADDRESS = "0x9410e8052Bc661041e5cB27fDf7d9e9e842af2aa"
export const MARKETS = {
    "Crypto.BTC/USD": {
        index: "0x86Bf1Ce7D5B26B158E1584770EA8b1605F02d4Cf",
        priceFeedId: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
    },
    "Crypto.CORE/USD": {
        index: "0xcC6BE48dD8c4BFF2B2515580a6Df3Db0FF06FD65",
        priceFeedId: "0x9b4503710cc8c53f75c30e6e4fda1a7064680ef2e0ee97acd2e3a7c37b3c830c",
    },
    "Crypto.ETH/USD": {
        index: "0x3Fe892d953B1010Ca43d2a0f462cA12eC4aC18CD",
        priceFeedId: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    },
    "Crypto.SOL/USD": {
        index: "0x8225CD4594c03799178b02150E04Afc57bEafEDC",
        priceFeedId: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
    },
    "Crypto.BNB/USD": {
        index: "0xA4dA7A9D0c0Cf669419BD3e161F8EfEd294872Ee",
        priceFeedId: "0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f",
    },
    "Crypto.DOGE/USD": {
        index: "0x3037ade187E6bb3a990e6Df45c8c3aDBD01C0240",
        priceFeedId: "0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c",
    },
    "Crypto.TRX/USD": {
        index: "0x3E66c7eDfe68654736A171D91741cF284C7746A5",
        priceFeedId: "0x67aed5a24fdad045475e7195c98a98aea119c763f272d4523f5bac93a4f33c2b",
    },
    "Crypto.SUI/USD": {
        index: "0xf5736c9FF7b98BB9DB036Fce2249084DC8C2F34B",
        priceFeedId: "0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744",
    },
    "Crypto.AVAX/USD": {
        index: "0xde7E28143b224DA1DbA65A617F87A40281bA51CA",
        priceFeedId: "0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7",
    },
    "Crypto.XRP/USD": {
        index: "0xF2f8Cb84Efea05De445ff2E23E698B90e17527dd",
        priceFeedId: "0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8",
    },
    "Crypto.SHIB/USD": {
        index: "0x4ee5972C4a84e51D72755f99a2273a5232408740",
        priceFeedId: "0xf0d57deca57b3da2fe63a493f4c25925fdfd8edf834b20f93e1f84dbd1504d4a",
    },
    "Crypto.BONK/USD": {
        index: "0x456DFE9e9cFB33A4D07707773ee87Cc9FBf5DDd2",
        priceFeedId: "0x72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419",
    },
    "Crypto.FLOKI/USD": {
        index: "0xb083E0E5d15Ac0DC5e8E101dd9079766Ba368261",
        priceFeedId: "0x6b1381ce7e874dc5410b197ac8348162c0dd6c0d4c9cd6322672d6c2b1d58293",
    },
    "Crypto.ENA/USD": {
        index: "0xF5e47e72c562DEF62926Ef40c9358840ee827241",
        priceFeedId: "0xb7910ba7322db020416fcac28b48c01212fd9cc8fbcbaf7d30477ed8605f6bd4",
    },
    "Crypto.LINK/USD": {
        index: "0xe679565507663B983ceA3252fBA92b47F51BEfdF",
        priceFeedId: "0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221",
    },
    "Crypto.POPCAT/USD": {
        index: "0x207C362e0A93bA1A77DC8a59b25183b8873aa6B4",
        priceFeedId: "0xb9312a7ee50e189ef045aa3c7842e099b061bd9bdc99ac645956c3b660dc8cce",
    },
};

export const POSITION_PROPS_LENGTH = 9


export async function fetchMarketPrices(markets: string[]): Promise<MarketPrice[]> {
    try {

        const symbolsQuery = markets.map(m => `ids[]=${encodeURIComponent(m)}`).join('&');
        const url = `https://hermes.pyth.network/v2/updates/price/latest?${symbolsQuery}&ignore_invalid_price_ids=true`;


        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonResponse = await response.json();
        const priceData: PriceData[] = jsonResponse.parsed


        return priceData.map(data => {
            const expo = data.price.expo;
            return {
                currentPrice: Number(data.price.price) * Math.pow(10, expo),
                confidence: Number(data.price.conf) * Math.pow(10, expo),
                emaPrice: Number(data.ema_price.price) * Math.pow(10, expo),
                lastUpdated: new Date(data.price.publishTime * 1000).toLocaleString(),
                priceFeedId: data.id
            };
        });

    } catch (error) {
        console.error('Error fetching market prices:', error);
        throw error;
    }
}
export async function fetchMarketPrice(market: string): Promise<MarketPrice> {
    try {

        const url = `https://hermes.pyth.network/v2/updates/price/latest?ids[]=${market}&ignore_invalid_price_ids=true`;


        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonResponse = await response.json();
        const priceData: PriceData = jsonResponse.parsed[0]


        const expo = priceData.price.expo;

        return {
            currentPrice: Number(priceData.price.price) * Math.pow(10, expo),
            confidence: Number(priceData.price.conf) * Math.pow(10, expo),
            emaPrice: Number(priceData.ema_price.price) * Math.pow(10, expo),
            lastUpdated: new Date(priceData.price.publishTime * 1000).toLocaleString(),
            priceFeedId: priceData.id
        };


    } catch (error) {
        console.error('Error fetching market prices:', error);
        throw error;
    }
}

export function toUsd(value: number) {
    const normalizedValue = value * Math.pow(10, 10);
    return ethers.BigNumber.from(Math.floor(normalizedValue)).mul(ethers.BigNumber.from(10).pow(20))
}


// fetchMarketPrices(markets)
//   .then(prices => {
//     prices.forEach(price => {
//       console.log(`\n${price.symbol} Price Data:`);
//       console.log(`Current Price: $${price.currentPrice.toLocaleString()}`);
//       console.log(`Confidence Interval: ±$${price.confidence.toLocaleString()}`);
//       console.log(`EMA Price: $${price.emaPrice.toLocaleString()}`);
//       console.log(`Last Updated: ${price.lastUpdated}`);
//       console.log(`Price Feed ID: ${price.priceFeedId}`);
//     });
//   })
//   .catch(error => console.error('Failed to fetch prices:', error));

