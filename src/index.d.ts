import { EventEmitter } from "events";
import { RedisOptions } from "ioredis";

declare class Whiteboard<T = any> extends EventEmitter {
    length: number;
  
    init(item: RedisOptions): T;

    publish(eventName: string, message: T);

    subscriber(eventName: string): Event;
}
