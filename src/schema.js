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

const tickerSubscriptionType = new GraphQLObjectType({

});

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query', // RootQueryType, root?
    fields: {
      tickers: {
        type: newGraphQLList(tickerType),
        args: {
          id: { type: GraphQLID }
        },
        resolve(_, args) {
          // repo ==== your db. Need to adapt to Redis setup
          return args.id ? repo.find(args.id) : repo.findAll()
        }
      }
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      updateTicker: {
        type: tickerType,
        args: {
          id: { type: GraphQLID }
        },
        resolve(_, args) {
          if (args.id) {
            // Redis.set().then(() => respond with payload)
          }
        }
      }
    }
  }),
  subscription: new GraphQLObjectType({
    name: 'Subscription',
    fields: {
      ticker: {
        // ??
      }
    }
  })
});
