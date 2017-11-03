var buildSchema = require('graphql').buildSchema;

// The ID scalar type represents a unique identifier,
// often used to refetch an object or as the key for a
// cache. The ID type is serialized in the same way as a
// String; however, defining it as an ID signifies that
// t is not intended to be human‐readable.

module.exports.schema = buildSchema(`
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

  type TickerInput {
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
    getTicker(id: !ID): Ticker
    allTickers: [Ticker]!
  }

  type Mutation {
    createTicker(input: TickerInput) : Ticker
    updateTicker(id: ID!, input: TickerInput) : Ticker
  }

  type Subscription {
    updatedTicker(id: ID!): Ticker
  }

  type Schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`);
