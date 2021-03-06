import { logger } from "./logger";
import {debounce} from "./Utils";

logger.log('Devices.js');

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
    logger.log("Bluetooth._onDataReceoved", data);
    this.onDataReceivedCallback(data);
    this.receivedDataArray = [];
  }

  onDataReceived(callback){
    this.onDataReceivedCallback = callback || (()=>{});
  }

};

/**
 * Relay utility module
 * example:
 *

 ```
  import { Relay } from "./Devices";
  let options = {
    pin: <Object>, // e,g, P1
  };
  let relay = new Relay(options);

  relay.set(1);
  relay.set(true);
  relay.set(0);
  relay.set(false);

 ```
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

/**
 * KnockDevice module
 * example:
 *
 ```
 import { KnockDevice } from "./Devices";
 let options = {
      pin: <Object>, // e,g, P1
      setWatchOpts: <Object> // opts passed to setWatch fn
    };
 let knockDevice = new KnockDevice(options);
 knockDevice.onKnock((e)=>{
  // callback when knock
 });
 ```
 *
 */

const KNOCK_DEVICE_SET_WATCH_OPTS_DEFAULT = {
  repeat: true,
  debounce: 20,
  edge: 'rising'
};
const KNOCK_DEVICE_DEBOUNCE = 100;

const KnockDevice = class {

  constructor(options) {
    logger.log("setup KnockDevice");
    let pin = options.pin;
    let setWatchOpts = options.setWatchOpts || KNOCK_DEVICE_SET_WATCH_OPTS_DEFAULT;
    this.onKnockCallback = (()=>{});

    // here we use KNOCK_DEVICE_DEBOUNCE
    // in order to catch only first knocking
    let shakeTimeout;
    let watcher = (e) => {
      if (shakeTimeout) return;
      this.onKnockEvent(e);
      shakeTimeout = setTimeout(
        () => { shakeTimeout = undefined; }
        , KNOCK_DEVICE_DEBOUNCE
      );
    };

    setWatch(watcher, pin, setWatchOpts);

  }

  onKnockEvent(e) {
    logger.log("KnockDevice onKnockEvent");
    this.onKnockCallback(e);
  }

  onKnock(callback) {
    this.onKnockCallback = callback || (() => {});
  }

};

export { Bluetooth, Relay, KnockDevice };
