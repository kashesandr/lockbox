var pin = P2;

function shake(e) {

  console.log('shaked', e.time);

}

setWatch(shake, pin, { repeat: true, edge: 'rising', debounce: 25 });
