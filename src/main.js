import { Locker } from "./Locker";
import { Auth } from "./Auth";
import { logger } from "./logger";
import { settings } from "./settings";

logger.log('main.js');

/**
 * Setup
 */
let locker = new Locker(settings.pin);
let auth = new Auth();

// TODO: set the code manually
const DEFAULT_CODE = [189.81586904765, 380.28420238092, 591.84163095231, 1036.09701785712, 1266.62794642860, 1892.38363095244, 2117.92424404760];
auth.setCode(DEFAULT_CODE);

let isReadyToSetUpNewCode = false;

locker.on('code-detected', (code) => {

  logger.log('code-detected', code);

  if (isReadyToSetUpNewCode) {
    auth.setCode(code);
    logger.log('new code has been set');
    isReadyToSetUpNewCode = false;
  } else {
    let authenticated = auth.verifyCode(code);
    logger.log('authenticated', authenticated);
    locker.servo.move(authenticated ? 0 : 1);
  }
});

locker.on('set-new-code', () => {
  logger.log('ready to set up new code');
  isReadyToSetUpNewCode = true;
});
