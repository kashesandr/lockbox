const Locker = class {

  constructor() {
    this._locked = false;
    this.code = []; // storing key code, an array of timestamps
    this.fluctuation = 0.1;
  }

  setCode(code){
    if (!code) return;
    if (!(code instanceof Array)) return;
    this.code = code;
  }
  getCode(){
    return this.code;
  }

  verifyCode(code){
    if (!code) return false;
    if (!(code instanceof Array)) return false;
    if (code.length !== this.code.length) return false;

    const [signalEnd] = code.slice(-1);
    const [codeEnd] = this.code.slice(-1);

    let coeff = signalEnd/codeEnd;
    let result = true;
    let fluctuation = this.fluctuation;
    this.code.forEach( (codeItem, index) => {
      let stamp = code[index]/coeff;
      let withinRange = ((stamp + fluctuation) >= codeItem && (stamp - fluctuation) <= codeItem);
      if (!withinRange)
        result = false;
    } );

    return result;
  }

};

export default Locker;
