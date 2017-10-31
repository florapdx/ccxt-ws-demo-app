import {
  graphql,
  GraphQLID,
  GraphQLSchema,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull
} from 'graphql';

import {
  nodeDefinitions,
  globalIdField,
  fromGlobalId,
  connectionDefinitions,
  connectionArgs,
  connectionFromArray
} from 'graphql-relay';

const tickerType = new GraphQLObjectType({
  name: 'ticker',
  description: 'ticker data for a given exchange and currency',
  fields: {
    id: GraphQLId
    symbol: GraphQLString,
    timestamp: GraphQLInt,
    datetime: GraphQLString,
    high: GraphQLInt,
    low: GraphQLInt,
    bid: GraphQLInt,
    ask: GraphQLInt,
    vwap: GraphQLInt,
    open: GraphQLInt,
    last: GraphQLInt,
    baseVolume: GraphQLInt,
    quoteVolume: GraphQLInt
  }
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query', // RootQueryType, root?
    fields: {
      tickers: {
        type: newGraphQLList(tickerType),
        args: {
          id: { type: GraphQLID }
        },
        resolve(_, args) {
          return args.id ? repo.find(args.id) : repo.findAll()
        }
      }
    }
  })
});


type TickerConnection {
  edges: [TickerEdge]
  pageInfo: PageInfo!
}

type TickerEdge {
  cursor: String!
  node: Ticker
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type Query {
  node(id: ID!): Node
}

type TickerSubscriptInput {
  tickerId: String
  clientSubscriptionId: String
}
