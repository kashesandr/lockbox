
// mocking for testing
// TODO: do not include in prod
// let P2 = P2 || null;
// let P3 = P3 || null;
// let Serial3 = Serial3 || null;

const settings = {
  pin: {
    knockPin: P2,
    relayPin: P3,
    bluetoothSerial: Serial3
  }
};

export { settings };
