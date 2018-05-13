import { Locker } from "./Locker";
import { Auth } from "./Auth";

let locker = new Locker({
  buttonPin: BTN1,
  servoPin: P3
});

let auth = new Auth();

// TODO: set the code manually
const DEFAULT_CODE = [ 189.81586904765, 380.28420238092, 591.84163095231, 1036.09701785712, 1266.62794642860, 1892.38363095244, 2117.92424404760 ];
auth.setCode(DEFAULT_CODE);
auth.fluctuation = 200;

locker.on('code-detected', (code) => {
  let authenticated = auth.verifyCode(code);
  locker.servo.move(
    authenticated ? 0 : 1, 1000
  );
});
