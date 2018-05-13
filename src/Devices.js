/*
  Servo motor utility module
  example:

  ```
    import { Servo } from "./Devices";
    let servo = new Servo(P3);

    s.move(1); // moving to position 1 over 1 second
    s.move(0); // moving to position 0 over 1 second
    s.move(0.5, 3000); // moving to position 0.5 over 3 seconds

    // moving to position 0 over 1 second, then move to position 1
    s.move(0, 1000, function() {
      s.move(1, 1000);
    });
  ```
*/

const DEFAULT_DURATION = 1000;
const DEFAULT_INTERVAL = 20;
const Servo = class {

  constructor(pin,options) {
    this.pin = pin;
    this.currentInterval = null;
    this.currentPosition = null;
    if (options && options.range) {
      this.range = options.range;
      this.offset = 1.5 - (options.range / 2);
    } else {
      this.offset = 1;
      this.range = 1;
    }
  }

  move(position, duration, cb) {

    if (!duration) duration = DEFAULT_DURATION;
    if (!this.currentPosition) this.currentPosition = position;
    if (this.currentInterval) clearInterval(this.currentInterval);

    let initialPosition = this.currentPosition;
    let amt = 0;

    let moveFn = () => {

      if (amt > 1) {
        clearInterval(this.currentInterval);
        delete this.currentInterval;
        amt = 1;
        if (cb) cb();
      }
      this.currentPosition = position * amt + initialPosition * (1 - amt);
      digitalPulse(this.pin, 1, this.offset + E.clip(this.currentPosition,0,1) * this.range);
      amt += 1000.0 / (DEFAULT_INTERVAL * duration);

    };

    this.currentInterval = setInterval(moveFn, DEFAULT_INTERVAL);
  }

};

export { Servo };
