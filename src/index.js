const EventEmitter = require("events");
const redis_man = require("./redis_man");
const WB = "whiteboard";
const WBPUBLISH = "WBPUBLISH";
const WBSUBSCRIBE = "WBSUBSCRIBE";

class Whiteboard extends EventEmitter {
  async init(opts) {
    redis_man.init({
      config: opts
    });

    redis_man.init({
      key: WBSUBSCRIBE,
      config: opts,
      oid: WB
    });

    redis_man.init({
      key: WBPUBLISH,
      config: opts,
      oid: WB
    });
    this.opts = opts;
    let connection = await redis_man.getConnection(WBSUBSCRIBE);
    connection.on("message", (channel, data) => {
      if (typeof data == "string") {
        try {
          data = JSON.parse(data);
        } catch (error) {
          data = { topic: channel, message: data };
        }
      }
      this.emit(data.topic, data.message);
    });
    connection = await redis_man.getConnection(WBPUBLISH);
  }

  async publish(topic, message) {
    const connection = await redis_man.getConnection(WBPUBLISH);
    connection.publish(topic, JSON.stringify({ topic, message }));
  }

  async subscribe(topic) {
    const connection = await redis_man.getConnection(WBSUBSCRIBE);
    connection.subscribe(topic, () => console.log("Subscribed to Topic:%s", topic));
  }
  async unsubscribe(topic) {
    const connection = await redis_man.getConnection(WBSUBSCRIBE);
    connection.unsubscribe(topic, () => console.log("Unsubscribed to Topic:%s", topic));
  }
}

module.exports = new Whiteboard();
module.exports.RedisMan = redis_man;
