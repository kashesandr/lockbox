import { Auth } from "./services/Auth";
import { logger } from "./logger";
import { settings } from "./settings";
import { Servo, Button, Bluetooth } from "./Devices";
import { SignalDetectionService } from "./services/SignalDetection";

logger.log('main.js');

const DEBUG_DEFAULT_CODE = [
  189.81586904765,
  380.28420238092,
  591.84163095231,
  1036.09701785712,
  1266.62794642860,
  1892.38363095244,
  2117.92424404760
];

let App = {

  run: () => {

    let isReadyToSetUpNewCode = false;

    let auth = new Auth();
    let servo = new Servo({pin: settings.servoPin});
    let button = new Button({pin: settings.buttonPin});
    let bluetooth = new Bluetooth({serialPort: settings.bluetoothSerial});

    let signalDetectionService = new SignalDetectionService();

    bluetooth.onDataReceived( () => {
      logger.log('ready to set up new code');
      isReadyToSetUpNewCode = true;
    });

    button.onClick((e) => {
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
        auth.setCode(code);
        logger.log('new code has been set');
        isReadyToSetUpNewCode = false;
      } else {
        let authenticated = auth.verifyCode(code);
        logger.log('authenticated', authenticated);
        servo.move(authenticated ? 0 : 1);
      }
    });

  }

};

export { App };
