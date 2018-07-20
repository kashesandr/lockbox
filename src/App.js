import { Auth } from "./services/Auth";
import { logger } from "./logger";
import { settings } from "./settings";
import { Bluetooth, Relay, KnockDevice } from "./Devices";
import { SignalDetectionService } from "./services/SignalDetection";

logger.log('main.js');

const DEBUG_DEFAULT_CODE = [
  0.11071835714,0.08259338095,0.10016359523,0.30911060714,0.09569125595,0.51507855357,0.07772857142
];

let App = {

  run: () => {

    let auth = new Auth();
    let bluetooth = new Bluetooth({serialPort: settings.pin.bluetoothSerial});
    let relay = new Relay({pin: settings.pin.relayPin});
    let knockDevice = new KnockDevice({pin: settings.pin.knockPin});

    let signalDetectionService = new SignalDetectionService();

    let triggerRelay = (relay, timeout = 400) => {
      relay.set(0);
      setTimeout((()=>{
        relay.set(1)
      }), timeout);
    };

    let isReadyToSetUpNewCode = false;
    bluetooth.onDataReceived( (data) => {
      if (data === "set") {
        isReadyToSetUpNewCode = true;
      }
      if (data === "open") {
        triggerRelay(relay);
      }
    });

    knockDevice.onKnock((e) => {
      // todo: generate timestamp based on `e` arg
      // there is a mistake (e.time - e.lastTime) -> fix it
      let timestamp = e.time - e.lastTime;
      signalDetectionService.putTimestamp(timestamp);
    });

    // TODO: set the code manually
    auth.setCode(DEBUG_DEFAULT_CODE);

    signalDetectionService.onSignalDetect( (code) => {

      logger.log('code-detected', code);

      if (isReadyToSetUpNewCode) {
        // TODO: store new code in FlashEEPROM
        // TODO: details https://www.espruino.com/FlashEEPROM
        auth.setCode(code);
        logger.log('new code has been set');
        isReadyToSetUpNewCode = false;
      } else {
        let authenticated = auth.verifyCode(code);
        logger.log('authenticated', authenticated);

        if (authenticated) {
          triggerRelay(relay);
        }

      }
    });

  }

};

export { App };
