const { expect } = require("chai");

describe("pub/sub", function () {
  it("should invoke the callback when subscribe successfully", (done) => {
    const whiteboard = require("../src/index");
    const topic = "say-hello";
    const message = JSON.stringify({ hello: "world" });
    whiteboard.init();
    whiteboard.on(topic, async (msg) => {
      expect(msg).to.equal(message);
      whiteboard.unsubscribe(topic);
      done();
      const connection = await whiteboard.RedisMan.getConnection();
      await connection.close();
    });
    whiteboard.subscribe(topic);

    whiteboard.publish(topic, message);
  });
});
