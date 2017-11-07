import { buildSchema } from 'graphql';

// The ID scalar type represents a unique identifier,
// often used to refetch an object or as the key for a
// cache. The ID type is serialized in the same way as a
// String; however, defining it as an ID signifies that
// it is not intended to be human‐readable.

export const schema = buildSchema(`
  type Ticker {
    id: ID!
    symbol: String!
    timestamp: Int!
    datetime: String
    high: Int
    low: Int
    bid: Int
    ask: Int
    vwap: Int
    open: Int
    last: Int
    baseVolume: Int
    quoteVolume: Int
  }

  input TickerInput {
    symbol: String!
    timestamp: Int!
    datetime: String
    high: Int
    low: Int
    bid: Int
    ask: Int
    vwap: Int
    open: Int
    last: Int
    baseVolume: Int
    quoteVolume: Int
  }

  type Query {
    getTicker(id: ID!): Ticker
    allTickers: [Ticker]!
  }

  type Mutation {
    createTicker(input: TickerInput) : Ticker
    updateTicker(id: ID!, input: TickerInput) : Ticker
  }

  type Subscription {
    subscribeToTicker(topic: String!): Ticker
  }

  type Schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`);
