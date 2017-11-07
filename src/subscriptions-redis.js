import redis from 'redis';
import { $$asyncIterator } from 'iterall';

/*
 * Simplistic Redis PubSub interface. Based on
 * https://github.com/davidyaha/graphql-redis-subscriptions, but stripped down
 * and no conflict with latest graphql-js native support for subscriptions.
 */

export default class RedisGraphQLPubSub {
  constructor(opts) {
    this.opts = opts;
    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();

    this.subscriberRefs = {};
    this.subscriptionRefs = {};
    this.subId = 0;

    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
    this.publish = this.publish.bind(this);
    this.returnAsyncIterator = this.returnAsyncIterator.bind(this);

    this.publisher.on('error', err => console.log('Redis publisher error: ', err));
    this.subscriber.on('error', err => console.log('Redis subscriber error: ', err));
    this.subscriber.on('message', this._onMessage.bind(this));
  }

  _onMessage(topic, message) {
    const subscribers = this.subscriptionRefs[topic];

    if (subscribers && message) {
      const parsed = JSON.parse(message);
      subscribers.forEach(id => this.subscriberRefs[id].handler(parsed));
    }
  }

  subscribe(topic, handler, opts) {
    this.subId += 1;

    this.subscriberRefs[this.subId] = {
      topic,
      handler
    };

    if (!this.subscriptionRefs[topic]) {
      this.subscriptionRefs[topic] = [];
    }

    if (this.subscriptionRefs[topic].length === 0) {
      return new Promise((resolve, reject) => {
        this.subscriber.subscribe(topic, (error) => {
          if (error) {
            delete this.subscriberRefs[this.subId];
            reject(error);
          } else {
            this.subscriptionRefs[topic].push(this.subId);
            resolve(this.subId);
          }
        });
      })
    } else {
      this.subscriptionRefs[topic].push(this.subId);
      return Promise.resolve(this.subId);
    }
  }

  unsubscribe(topic, subId) {
    if (!this.subscriberRefs[topic] || !this.subscriptionRefs[subId]) {
      return;
    }

    this.subscriptionRefs[topic] = this.subscriptionRefs[topic].filter(s => s !== subId);
    delete this.subscriberRefs[subId];

    if (!this.subscriberRefs[topic].length) {
      this.subscriber.unsubscribe(topic);
    }
  }

  publish(topic, message) {
    return this.publisher.publish(topic, message);
  }

  returnAsyncIterator(subscriptionName) {
    let resolver;

    this.sub.on('message', (topic, message) => {
      message = JSON.parse(message);

      if (resolver && subscriptionName === topic) {
        resolver(message);
      }
    });

    return {
      next() {
        return new Promise(resolve => { resolver = resolve; })
          .then(value => ({ value, done: false }));
      },
      throw(err) {
        return Promise.reject(err);
      },
      return() {
        return Promise.resolve({ value: undefined, done: true });
      },
      [$$asyncIterator]() {
        return this;
      }
    };
  }
}
