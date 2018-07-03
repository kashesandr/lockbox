import { debounce } from "./Utils";
import { Servo } from "./Devices";
import { logger } from "./logger";

logger.log('Locker.js');

const Locker = class {

  constructor(options){

    this.events = {};

    ({servoPin, buttonPin, bluetoothSerial} = options);

    this.servo = this.setupServo(servoPin);
    this.button = this.setupButton(buttonPin);
    this.bluetooth = this.setupBluetooth(bluetoothSerial);
  }

  setupButton(pin){

    logger.log("setupButton");

    let isFirstPress = false;
    let firstPressTimestamp = null;
    let signalTimestamps = [];
    let detection = () => {
      logger.log("setupButton detection");
      isFirstPress = true;
      let cb = this.events['code-detected'] || (()=>{});
      cb(signalTimestamps);
      signalTimestamps = [];
      firstPressTimestamp = null
    };
    let detectionDebounced = debounce(detection, 2000);

    function btnClick(e) {

      logger.log("setupButton btnClick");

      if (isFirstPress) {
        firstPressTimestamp = (new Date()).getTime();
        isFirstPress = false;
      } else {
        // TODO: reuse Espruino's built-in features e.time - e.lastTime
        let timestamp = (new Date()).getTime();
        let deltaTime = timestamp - firstPressTimestamp;
        signalTimestamps.push(deltaTime);
        detectionDebounced();
      }

    }

    // TODO: setWatch doesn't work after reloading
    setWatch(btnClick, pin, { repeat: true, debounce: 20, edge: 'rising'  });

    return pin;

  }

  setupServo(pin){
    let servo = new Servo(pin);
    return servo;
  }

  setupBluetooth(serial){
    serial.setup(9600);

    let receivedDataArray = [];
    const finishDebounced = debounce(()=>{
      this.events['bluetooth-data-received'](receivedDataArray.join(""));
      receivedDataArray = [];
    }, 100);

    serial.on('data', function (data) {
      receivedDataArray.push(data);
      finishDebounced();
    });

    this.on('bluetooth-data-received', (data)=>{

      if (data === "set") {
        this.events['set-new-code']()
      }

      // TODO: implement logger enable/disable
      // if (data === "log") {
      //   this.events['set-new-code']()
      // }

    })
  }

  on(eventName, callback){
    this.events[eventName] = callback;
  }

};

export { Locker };
