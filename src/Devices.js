/**
 * Servo motor utility module
 * example:
 *

  ```
    import { Servo } from "./Devices";
    let options = {
      pin: <Object>, // e,g, P1
    };
    let servo = new Servo(options);

    s.move(1); // moving to position 1 over 1 second
    s.move(0); // moving to position 0 over 1 second
    s.move(0.5, 3000); // moving to position 0.5 over 3 seconds

    // moving to position 0 over 1 second, then move to position 1
    s.move(0, 1000, function() {
      s.move(1, 1000);
    });
  ```
 *
*/

import { logger } from "./logger";
import {debounce} from "./Utils";

logger.log('Devices.js');

const SERVO_DEFAULT_DURATION = 1000;
const SERVO_DEFAULT_INTERVAL = 20;

// TODO: remove since it is deprecated
const Servo = class {

  constructor(options) {
    this.pin = options.pin;
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

    if (!duration) duration = SERVO_DEFAULT_DURATION;
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
      amt += 1000.0 / (SERVO_DEFAULT_INTERVAL * duration);

    };

    this.currentInterval = setInterval(moveFn, SERVO_DEFAULT_INTERVAL);
  }

};


/**
 * Button module
 * example: 
 *
  ```
    import { Button } from "./Devices";
    let options = {
      pin: <Object>, // e,g, P1
      setWatchOpts: <Object> // opts passed to setWatch fn
    };
    let btn = new Button(options);
 ```
 * 
 */

const SET_WATCH_OPTS_DEFAULT = {
  repeat: true,
  debounce: 20,
  edge: 'rising'
};

const Button = class {
  
  constructor(options) {
    logger.log("setupButton");
    let pin = options.pin;
    let setWatchOpts = options.setWatchOpts || SET_WATCH_OPTS_DEFAULT;
    setWatch(this.btnClick.bind(this), pin, setWatchOpts);
  }
  
  btnClick(e) {
    logger.log("setupButton btnClick");
    this.btnClickCallback(e);
  }

  onClick(callback) {
    this.btnClickCallback = callback || (() => {});
  }
  
};

/**
 * Bluetooth module
 * example:
 *
  ```
    import { Bluetooth } from "./Devices";
    let options = {
      serialPort: <Object> // e.g. Serial3
      baudRate: <Number> // e.g. 9600 <- this is default
      debounceTimeout: <Number> // e.g. 100 <- this is default
    };
    let bluetooth = new Bluetooth(options);
  ```
 *
 */
const DEFAULT_BAUD_RATE = 9600;
const DEFAULT_DEBOUNCE_TIMEOUT = 100;

const Bluetooth = class {

  constructor(options){
    let serial = options.serialPort;
    let rate = options.baudRate || DEFAULT_BAUD_RATE;
    let debouceTimeout = options.debounceTimeout || DEFAULT_DEBOUNCE_TIMEOUT;
    serial.setup(rate);

    this.receivedDataArray = [];
    this.onDataReceivedCallback = (() => {});

    this.onDataReceivedDebounced =
      debounce( () => { this._onDataReceived() }, debouceTimeout );

    serial.on('data', this.onDataReceiving.bind(this));

  }

  onDataReceiving(data){
    this.receivedDataArray.push(data);
    this.onDataReceivedDebounced();
  }

  _onDataReceived(){
    let data = this.receivedDataArray.join("");
    this.onDataReceivedCallback(data);
    this.receivedDataArray = [];
  }

  onDataReceived(callback){
    this.onDataReceivedCallback = callback || (()=>{});
  }

};

/**
 *
 */

const Relay = class {

  constructor(options){
    this.pin = options.pin;
  }

  set(bool){
    this.pin.write(bool ? 1 : 0);
  }

};

export { Servo, Button, Bluetooth, Relay };
