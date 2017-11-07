// A follow-up to this should be to extend the top level
// graphql() function to directly support subscriptions!

// 1. set up db, start ingesting data
// 2. client requests initial data
// 3. client subscribes to updates
// 4. server requests more data on interval
// 5. data gets saved then calls out to graphql to respond;
// 6. graphql acks back with result and the subscriber pushes that out;

// Resolver methods accept the arguments: (obj, args, context):
//  * obj: previous object, often not used for a field on root Query type
//  * args: args passed to the resolver, such as `id` &/or input data
//  * context: context object passed through from server [here { db, pubsub }]

export const rootResolvers = {
  getTicker: (_, { id }, { db }) => {
    const ticker = db.get(id);
    if (!ticker) {
      throw new Error ('no ticker exists for this id');
    }
    return { id, ...ticker };
  },
  createTicker: (_, { input }, { db }) => {
    var id = (`${input.symbol}_`).join(require('crypto').randomBytes(10).toString('hex'));
    db.set(id, input);
    return { id, ...input };
  },
  updateTicker: (_, { id, input }, { db }) => {
    db.set(id, input);
    return { id, ...input };
  },
  subscribeToTicker: (_, { ticker }, { pubsub }) => {
    return {
      subscribe: () => pubsub.returnAsyncIterator(ticker)
    };
  }
};
