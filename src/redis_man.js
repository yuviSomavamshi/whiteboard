"use strict";
const RedisStore = require("ioredis");

const OAM = require("oam-node");
const DEFAULT_KEY = "default";

class RedisMan {
  constructor() {
    this.pool = {};
  }

  init(props) {
    if (!props) {
      props = {
        key: DEFAULT_KEY,
        config: {
          host: "127.0.0.1",
          port: 6379,
          db: 0
        },
        oid: "Unknown"
      };
    }
    if (!props.key) {
      props.key = DEFAULT_KEY;
    }
    this.pool[props.key] = {
      config: props.config,
      oid: props.oid,
      redis: null, // initial value, when no connection is yet attempted.
      status: 0 // status of connection.
    };
  }

  getConnection(key = DEFAULT_KEY) {
    return new Promise((resolve, reject) => {
      const conn = this.pool[key];
      if (conn && conn.redis != null && conn.status == 1) {
        resolve(conn.redis);
      } else {
        conn.redis = new RedisStore(conn.config);
        conn.redis.setMaxListeners(100);
        conn.redis.on("ready", () => {
          conn.status = 1;
          this.pool[key] = conn;
          OAM.emit("clearAlert", conn.oid);
          return resolve(conn.redis);
        });

        conn.redis.on("error", (e) => {
          conn.redis = null;
          conn.status = 0;
          e.config = conn.config;
          OAM.emit("criticalAlert", conn.oid);
          return reject(e);
        });
      }
    });
  }

  health() {
    const report = {};
    Object.keys(this.pool).forEach((key) => {
      report[key] = this.pool[key].status == 1 ? "OK" : "KO";
    });
    return report;
  }
}

module.exports = new RedisMan();
module.exports.RedisStore = RedisStore;
