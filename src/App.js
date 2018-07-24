import { Auth } from "./services/Auth";
import { logger } from "./logger";
import { settings } from "./settings";
import { Bluetooth, Relay, KnockDevice } from "./Devices";
import { SignalDetectionService } from "./services/SignalDetection";

logger.log('main.js');

const DEBUG_DEFAULT_CODE = [
  352.18447023809,523.22069642856,955.59352380951,1151.93428571428,1838.82752380952,2025.70342857142
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

    let isFirstPress = true;
    let firstPressTimestamp = 0;
    knockDevice.onKnock((e) => {

      if (isFirstPress) {
        firstPressTimestamp = (new Date()).getTime();
        isFirstPress = false;
      } else {
        let timestamp = (new Date()).getTime();
        let deltaTime = timestamp - firstPressTimestamp;
        signalDetectionService.putTimestamp(deltaTime);
      }

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

        isFirstPress = true;
        firstPressTimestamp = 0;

      }
    });

  }

};

export { App };
