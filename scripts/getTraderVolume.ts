

const endpoint = "https://thegraph.coredao.org/subgraphs/name/satoshi-perps-mainnet-stats-f0aca40abf13e5b5"


interface DailyVolume {
    timestamp: number;
    marginIncreaseVolume: number;
    marginDecreaseVolume: number;
    totalMarginVolume: number;
}


async function fetchDailyVolumes(
    startTimestamp: number,
    endTimestamp: number,
): Promise<DailyVolume[]> {
    const query = `
      query get_daily_volumes($startTime: Int!, $endTime: Int!) {
        userVolumes(
          where: {
            timestamp_gte: $startTime,
            timestamp_lte: $endTime,
            period: "daily"
          }
          orderBy: timestamp
          orderDirection: asc
        ) {
          timestamp
          marginIncreaseVolume
          marginDecreaseVolume
          totalMarginVolume
        }
      }
    `;

    try {
        const response = await querySubgraph(
            endpoint,
            query,
            {
                startTime: startTimestamp,
                endTime: endTimestamp
            }
        );

        return response.data.userVolumes.map(volume => ({
            timestamp: volume.timestamp,
            marginIncreaseVolume: Number(volume.marginIncreaseVolume) * 10 ** -30,
            marginDecreaseVolume: Number(volume.marginDecreaseVolume) * 10 ** -30,
            totalMarginVolume: Number(volume.totalMarginVolume) * 10 ** -30
        }));

    } catch (error) {
        console.error("Error fetching daily volumes:", error);
        throw error;
    }
}

async function fetchUserDailyVolumes(
    userAddress: string,
    startTimestamp: number,
    endTimestamp: number,
): Promise<DailyVolume[]> {
    const query = `
      query get_user_volumes($user: String!, $startTime: Int!, $endTime: Int!) {
        userVolumes(
          where: {
            user: $user,
            timestamp_gte: $startTime,
            timestamp_lte: $endTime,
            period: "daily"
          }
          orderBy: timestamp
          orderDirection: asc
        ) {
          timestamp
          marginIncreaseVolume
          marginDecreaseVolume
          totalMarginVolume
        }
      }
    `;

    try {
        const response = await querySubgraph(
            endpoint,
            query,
            {
                user: userAddress.toLowerCase(),
                startTime: startTimestamp,
                endTime: endTimestamp
            }
        );

        return response.data.userVolumes.map(volume => ({
            timestamp: volume.timestamp,
            marginIncreaseVolume: Number(volume.marginIncreaseVolume) * 10 ** -30,
            marginDecreaseVolume: Number(volume.marginDecreaseVolume) * 10 ** -30,
            totalMarginVolume: Number(volume.totalMarginVolume) * 10 ** -30
        }));

    } catch (error) {
        console.error("Error fetching user daily volumes:", error);
        throw error;
    }
}


async function querySubgraph(endpoint: string, query: string, variables: any): Promise<any> {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

async function getTraderVolume() {
    const startDate = new Date('2024-12-22').getTime() / 1000;
    const endDate = new Date('2025-01-25').getTime() / 1000;


    console.log({ startDate, endDate });

    const userVolume = await fetchUserDailyVolumes("0xb08c0b39bad8ed79da4db80d6a07cb56a204368b", startDate, endDate)
    console.log({ userVolume });


}
getTraderVolume().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});