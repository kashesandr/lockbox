import { logger } from "../logger";
import { debounce } from "../Utils";

logger.log('signal-detection.js', 'loaded');

/**
 *
 * Service that helps to putTimestamp timestamped code
 *
 */

const CODE_DETECT_TIMEOUT_DEFAULT = 2000;

const SignalDetectionService = class {

  constructor() {

    this.codeDetectionTimeout = CODE_DETECT_TIMEOUT_DEFAULT;
    this.signalTimestamps = [];
    this.signalDetectionInProgress = false;

    this.updateCodeDetectionDebounced();

  }

  updateCodeDetectionDebounced (
    codeDetectionTimeout =
      this.codeDetectionTimeout || CODE_DETECT_TIMEOUT_DEFAULT
  ) {
    logger.log('SignalDetectionService.updateCodeDetectionDebounced()', codeDetectionTimeout);
    this.detectCodeDebounced = debounce(
      this.onCodeDetected.bind(this),
      codeDetectionTimeout
    );
  }

  /**
   * @param timestamp
   */
  putTimestamp (timestamp) {
    logger.log('SignalDetectionService.putTimestamp()', timestamp);
    if (this.signalDetectionInProgress) {
      this.signalTimestamps.push(timestamp);
    }
    this.signalDetectionInProgress = true;
    this.detectCodeDebounced();
  }

  onCodeDetected () {
    logger.log("SignalDetectionService.onCodeDetected", 'called');

    let callback = this.onSignalDetectCallback || (() => {});
    callback(this.signalTimestamps);

    this.signalTimestamps = [];
    this.signalDetectionInProgress = false;
  }

  onSignalDetect(callback){
    this.onSignalDetectCallback = callback; // todo check context
  }

  setDetectionTimeout (timeout) {
    this.codeDetectionTimeout = timeout;
    this.updateCodeDetectionDebounced();
  }

  getTimestamps(){
    return this.signalTimestamps;
  }

};

export { SignalDetectionService };
