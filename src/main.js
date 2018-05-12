import { debounce } from './Utils';

let isFirstPress = false;
let firstPressTimestamp = null;
let signalTimestamps = [];

let finishDetection = () => {
  isFirstPress = true;
  lockUnlock(signalTimestamps);
  signalTimestamps = [];
};
let finishDetectionDebounced = debounce(finishDetection, 2000);

function btnClick() {

  if (isFirstPress) {
    firstPressTimestamp = new Date();
    isFirstPress = false;
  } else {
    let timestamp = new Date();
    let deltaTime = timestamp - firstPressTimestamp;
    finishDetectionDebounced();
    signalTimestamps.push(deltaTime);
  }

}

function lockUnlock(code){
  console.log(code);
}

setWatch(btnClick, BTN1, { repeat: true, edge: "rising" });

