const redis = require('redis');
const $$asyncIterator = require('iterall').$$asyncIterator;
const execute = require('graphql').execute;
const subscribe = require('graphql').subscribe;

// Takes a Redis client instance.

// GraphQL subscriptions redis uses graphql-subscriptions, and in
// particular the PubSubEngine, which it implements.
// export interface PubSubEngine {
//   publish(triggerName: string, payload: any): boolean; // EE emits payload
//   subscribe(triggerName: string, onMessage: Function, options: Object): Promise<number>; // EE adds listener(eventName, onMessage)
//   unsubscribe(subId: number); // EE removes listener
//   asyncIterator<T>(triggers: string | string[]): AsyncIterator<T>; // EE and asyncIterator : push and pull queues which hold promises. IDGI
// }

// @@@!!!! NOTE: Flora, you can't do it like this b/c you need to export
// A PubSub engine object that contains the subscribe, unsubscribe, publish, and asyncIterator methods

function onMessage(message) {
  const { data } = message;

  if (!data) {
    return;
  }


}

module.exports.initRedisPubSub = (pub, sub) => {
  // Attach error listeners
  const pub = redis.createClient();
  const sub = redis.createClient();

  pub.on('error', err => console.log('Redis publisher error: ', err));
  sub.on('error', err => console.log('Redis subscriber error: ', err));

  sub.on('message', onMessage);
}