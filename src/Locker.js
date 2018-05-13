import {debounce} from "./Utils";
import {Servo} from "./Devices";

const Locker = class {

  constructor(options){

    this.events = {};

    ({servoPin, buttonPin} = options);
    this.servo = this.setupServo(servoPin);
    this.button = this.setupButton(buttonPin);

  }

  setupButton(pin){

    let isFirstPress = false;
    let firstPressTimestamp = null;
    let signalTimestamps = [];
    let detection = () => {
      isFirstPress = true;
      let cb = this.events['code-detected'] || (()=>{});
      cb(signalTimestamps);
      signalTimestamps = [];
    };
    let detectionDebounced = debounce(detection, 2000);

    function btnClick() {

      if (isFirstPress) {
        firstPressTimestamp = new Date();
        isFirstPress = false;
      } else {
        let timestamp = new Date();
        let deltaTime = timestamp - firstPressTimestamp;
        detectionDebounced();
        signalTimestamps.push(deltaTime);
      }

    }

    setWatch(btnClick, pin, { repeat: true, edge: "rising" });

    return pin;

  }

  setupServo(pin){
    let servo = new Servo(pin);
    return servo;
    // servo.move(1, 3000); // move to position 0.5 over 3 seconds
  }

  on(eventName, callback){
    this.events[eventName] = callback;
  }

};

export { Locker };
