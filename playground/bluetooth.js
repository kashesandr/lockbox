var btSerial = Serial3;
btSerial.setup(9600);

setInterval(function () {
  btSerial.write("pong");
}, 1000);

btSerial.print("ping");
