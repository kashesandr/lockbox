import { Auth } from "./services/Auth";
import { logger } from "./logger";
import { settings } from "./settings";
import { Servo, Button, Bluetooth } from "./Devices";
import { SignalDetectionService } from "./services/SignalDetection";

logger.log('main.js');

const DEBUG_DEFAULT_CODE = [
  0.11071835714,0.08259338095,0.10016359523,0.30911060714,0.09569125595,0.51507855357,0.07772857142
];

let App = {

  run: () => {

    let isReadyToSetUpNewCode = false;

    let auth = new Auth();
    let servo = new Servo({pin: settings.pin.servoPin});
    let button = new Button({pin: settings.pin.buttonPin});
    let bluetooth = new Bluetooth({serialPort: settings.pin.bluetoothSerial});

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
