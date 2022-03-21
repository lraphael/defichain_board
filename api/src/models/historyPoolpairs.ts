import { Schema, model } from 'mongoose'

interface HistoryPoolpairs {
  id: string,
  symbol: string,
  displaySymbol: string,
  name: string,
  status: boolean,
  tokenA: {
    symbol: string,
    displaySymbol: string,
    id: string,
    reserve: string,
    blockCommission: string
  },
  tokenB: {
    symbol: string,
    displaySymbol: string,
    id: string,
    reserve: string,
    blockCommission: string
  },
  priceRatio: { ab: string, ba: string },
  commission: string,
  totalLiquidity: { token: string, usd: string },
  tradeEnabled: boolean,
  ownerAddress: string,
  rewardPct: string,
  creation: {
    tx: string,
    height: number
  },
  apr: { reward: number, total: number }
}

const schema = new Schema<HistoryPoolpairs>({
  id: { type: String },
  symbol: { type: String },
  displaySymbol: { type: String },
  name: { type: String },
  status: { type: Boolean },
  tokenA: {
    symbol: { type: String },
    displaySymbol: { type: String },
    id: { type: String },
    reserve: { type: String },
    blockCommission: { type: String }
  },
  tokenB: {
    symbol: { type: String },
    displaySymbol: { type: String },
    id: { type: String },
    reserve: { type: String },
    blockCommission: { type: String }
  },
  priceRatio: { ab: { type: String }, ba: { type: String } },
  commission: { type: String },
  totalLiquidity: { token: { type: String }, usd: { type: String } },
  tradeEnabled: { type: Boolean },
  ownerAddress: { type: String },
  rewardPct: { type: String },
  creation: {
    tx: { type: String },
    height: { type: Number }
  },
  apr: { reward: { type: Number }, total: { type: Number } }
}, { timestamps: true })

export const HistoryPoolpairsModel = model<HistoryPoolpairs>('HistoryPoolpairs', schema)
