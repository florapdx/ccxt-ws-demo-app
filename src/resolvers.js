
const UPDATED_TICKER_CHANNEL = 'updated_ticker';

// A follow-up to this should be to extend the top level
// graphql() function to directly support subscriptions!

// 1. set up db, start ingesting data
// 2. client requests initial data
// 3. client subscribes to updates
// 4. server requests more data on interval
// 5. data gets saved then calls out to graphql to respond;
// 6. graphql acks back with result and the subscriber pushes that out;


module.exports.rootResolvers = {
  getTicker: ({ id }) {
    const ticker = db.get(id);
    if (!ticker) {
      throw new Error ('no ticker exists for this id');
    }
    return { id, ...ticker };
  },
  createTicker: ({ input }) {
    var id = (`${input.symbol}_`).join(require('crypto').randomBytes(10).toString('hex'));
    db.set(id, input);
    return { id, ...input };
  }
  updateTicker: ({ id, input }) {
    db.set(id, input);
    return { id, ...input };
  },
  updatedTicker: ({ id }) {
    return {
      subscribe: () => pubsub.asyncIterator(UPDATED_TICKER_CHANNEL),
    };
  }
};



// Create specific subscriptions using the channel options feature.
// Supports subscriptions that use the dot notation to specify subscription.
// The `setupFunctions` property passed to SubscriptionManager below
// specifies how to handle options passed to subscribe().
// This allows us to add metadata to response objects so we can id
// topics/channels from responses.
// const pubsub = new RedisPubSub({
//   triggerTransform: (trigger, { path }) => ([trigger, ...path].join('.')),
//   publisher: redis.createClient(),
//   subscriber: redis.createClient()
// });

// const subscriptionManager = new SubscriptionManager({
//   schema,
//   pubsub,
//   setupFunctions: {
//     tickerUpdate: (options, { symbol }) => ({
//       'ticker.update': {
//         channelOptions: { path: [symbol] },
//       },
//     }),
//   }
// });

