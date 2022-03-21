import { ApolloServer, gql } from 'apollo-server-express'
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core'
import express from 'express'
import http from 'http'

import 'dotenv/config'
import { connect } from 'mongoose'
import { HistoryPoolpairsModel } from './models/historyPoolpairs'

const typeDefs = gql`
  scalar Date
  scalar Time
  scalar DateTime

  type tokenA {
    symbol: String
      displaySymbol: String
      id: String
      reserve: String
      blockCommission: String
  }

  type priceRatio {
    ab: String
    ba: String
  }

  type totalLiquidity {
    token: String
    usd: String
  }

  type creation {
    tx: String
    height: Int
  }

  type apr {
    reward: String
    total: String
  }

  type HistoryPoolpair {
    id: String
    symbol: String
    displaySymbol: String
    name: String
    status: Boolean
    tokenA: tokenA
    tokenB: tokenA
    priceRatio: priceRatio
    commission: String
    totalLiquidity: totalLiquidity
    tradeEnabled: Boolean
    ownerAddress: String
    rewardPct: String
    creation: creation
    apr: apr
    createdAt: DateTime
  }

  type Query {
    listPoolPairs(symbol: [String],  createdAtGte: DateTime, createdAtLt: DateTime): [HistoryPoolpair]
    poolpairs: [String]
  }
`

type listPoolPairsArgs = {
  symbol?: [string]
  createdAtLt?: string
  createdAtGte?: string
}

const resolvers = {
  Query: {
    async listPoolPairs (_parent: any, args: listPoolPairsArgs) {
      console.log(args)
      // db.historypoolpairs.aggregate([{$match: {createdAt: {$gte: ISODate("2022-02-19T15:00:00.0Z"), $lt: ISODate("2022-02-20T00:11:00.0Z")}}}])
      const filter = {} as any
      if (args.symbol) {
        filter.symbol = { $in: args.symbol }
      }
      if (args.createdAtLt && args.createdAtGte) {
        filter.createdAt = { $gte: new Date(args.createdAtGte), $lt: new Date(args.createdAtLt) }
      } else if (args.createdAtLt) {
        filter.createdAt = { $lt: new Date(args.createdAtLt) }
      } else if (args.createdAtGte) {
        filter.createdAt = { $gte: new Date(args.createdAtGte) }
      }
      return await HistoryPoolpairsModel.find(filter)
    },
    async poolpairs () {
      const item = await HistoryPoolpairsModel.distinct('symbol')
      return item
    }
  }
}

async function run (): Promise<void> {
  console.log('starting')

  // 4. Connect to MongoDB
  const DATABASE_URL = process.env.DATABASE_URL
  await connect(`mongodb://${DATABASE_URL}/defiboard?authSource=admin`)
  console.log('connected')
}

async function listen (port: number) {
  const app = express()
  const httpServer = http.createServer(app)

  await run()

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
  })
  await server.start()

  server.applyMiddleware({ app })

  return new Promise((resolve, reject) => {
    httpServer.listen(port).once('listening', resolve).once('error', reject)
  })
}

async function main () {
  try {
    await listen(3000)
    console.log('🚀 Server is ready at http://localhost:3000/graphql')
  } catch (err) {
    console.error('💀 Error starting the node server', err)
  }
}

void main()
