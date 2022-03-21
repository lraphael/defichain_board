import { connect } from 'mongoose'
import { WhaleApiClient } from '@defichain/whale-api-client'
import * as schedule from 'node-schedule'
import { HistoryPoolpairsModel } from './models/historyPoolpairs'
import 'dotenv/config'

run().catch(err => console.log(err))

const client = new WhaleApiClient({
  url: 'https://ocean.defichain.com',
  timeout: 60000,
  version: 'v0',
  network: 'mainnet'
})

async function run (): Promise<void> {
  console.log('starting')

  // 4. Connect to MongoDB
  const DATABASE_URL = process.env.DATABASE_URL
  await connect(`mongodb://${DATABASE_URL}/defiboard?authSource=admin`)
  // *    *    *    *    *    *
  // ┬    ┬    ┬    ┬    ┬    ┬
  // │    │    │    │    │    │
  // │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
  // │    │    │    │    └───── month (1 - 12)
  // │    │    │    └────────── day of month (1 - 31)
  // │    │    └─────────────── hour (0 - 23)
  // │    └──────────────────── minute (0 - 59)
  // └───────────────────────── second (0 - 59, OPTIONAL)
  schedule.scheduleJob('0 * * * *', async function () {
    const now = new Date()
    console.log(`getData ${now.toLocaleString()}`)
    const res = await client.poolpairs.list(100)
    for (const poolpair of res) {
      const doc = new HistoryPoolpairsModel(poolpair)
      await doc.save()
    }
  })
}
