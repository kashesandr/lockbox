import {logger} from "./../logger";

logger.log('Auth.js');

const DEFAULT_FLUCTUATION = 0.05;
const FLUCTUATION_SHIFT = 0.01;

const Auth = class {

  constructor() {
    this.code = []; // storing key code, an array of timestamps
    this.fluctuationPct = DEFAULT_FLUCTUATION; 
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
    let fluctuation = +(signalEnd * this.fluctuationPct + FLUCTUATION_SHIFT).toFixed(2);

    let result = true;

    this.code.forEach( (codeItem, index) => {
      let codeItemNormalized = +(codeItem*coeff).toFixed(2);
      let signalItem = code[index];

      let gt = +(parseFloat(codeItemNormalized + fluctuation )).toFixed(2);
      let lt = +(parseFloat(codeItemNormalized - fluctuation )).toFixed(2);

      let withinRange = gt >= signalItem && lt <= signalItem;

      if (!withinRange) result = false;
    } );

    logger.log("Auth.verifyCode", result);
    return result;
  }

  setFluctuation(val){
    logger.log("Auth.setFluctuation", val);
    this.fluctuationPct = val || DEFAULT_FLUCTUATION;
  }

};

export { Auth };
