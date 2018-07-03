// var pin = P2;
var pin = BTN1;

function btnClick(e) {

  console.log('delta time', e.time - e.lastTime);

}

setWatch(btnClick, pin, { repeat: true, debounce: 20 });
