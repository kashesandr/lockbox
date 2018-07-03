import { settings } from './settings';

/**
 * Simplest silly logger for debugging
 *
 * Actually there is a bug with it.
 * For some reason the app is unstable when
 * something is pushed into console.log,
 * as I found - Espruino waits for recipients for logged data
 * and breaks logic if there are no ones
 *
 * @type {Logger}
 */
const Logger = class {

  isEnabled: false;

  constructor (bluetoothSerial) {
    this.bluetoothSerial = bluetoothSerial;
  }

  log (message, arg) {
    if (!this.isEnabled) return false;
    let txt = `${message}: ${arg}`;
    if (console && console.log)
      console.log(txt);
    if (this.bluetoothSerial)
      this.bluetoothSerial.print(txt);
  }

  enabled (bool) {
    this.isEnabled = bool;
  }

};

let logger = new Logger(settings.pin.bluetoothSerial);

export { logger };
