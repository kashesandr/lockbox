// gulp build && npm run espruino ./dist/lockbox.js && npm run espruino --watch

var next_state = 1;
function swap() {
  LED1.write(next_state);
  next_state = !next_state;
  console.log(next_state);
}

setWatch(swap, BTN1, {repeat:true, edge:"rising"});

