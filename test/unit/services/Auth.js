import { Auth } from '../../../src/services/Auth';

describe('Auth', () => {

  let auth = null;
  beforeEach(()=>{
    auth = new Auth();
  });
  afterEach(()=>{
    auth = null;
  });

  it('class should exist', () => {
    return expect(Auth).to.exist;
  });

  it('can be initialized', () => {
    let auth = new Auth();
    return expect(auth).to.exist;
  });

  describe('when just initialized', () => {

    it('should have empty code', ()=>{
      expect(auth.code).to.deep.equal([]);
    });

    it('should have set up fluctuation', ()=>{
      expect(auth.fluctuationPct).to.equal(0.2);
    });

  });

  it('can set/get code', ()=>{
    expect(auth.setCode).to.exist;

    auth.setCode();
    expect(auth.getCode()).to.deep.equal([]);

    auth.setCode(1);
    expect(auth.getCode()).to.deep.equal([]);

    auth.setCode([1,2,3]);
    expect(auth.getCode()).to.deep.equal([1,2,3]);
  });

  it('can verify code with existing', ()=>{
    expect(auth.verifyCode).to.exist;

    auth.setCode([1,2,3]);
    expect(auth.verifyCode([1,2,3])).to.equal(true, 'same code');

    expect(auth.verifyCode([1,2])).to.equal(false, 'less length');

    expect(auth.verifyCode([2,4,6])).to.equal(true, 'same code but 2 times slower');
  });

  it('can verify code with fluctuation', ()=>{
    expect(auth.setFluctuation).to.exist;
    let fl = 0;
    auth.setFluctuation(0.1);
    auth.setCode([1,2,3]);

    expect(auth.verifyCode([1,2,3]), 'fluctuation = 0.1 -> true').to.be.true;

    // fluctuation depends on signal length
    fl = 1*0.1;
    expect(auth.verifyCode([0.33, 0.66, 1]), 'fluctuation = 0.1 -> true 0').to.be.true;
    expect(auth.verifyCode([0.33+fl, 0.66+fl, 1]), 'fluctuation = 0.1 -> true 1').to.be.true;
    expect(auth.verifyCode([0.33-fl, 0.66-fl, 1]), 'fluctuation = 0.1 -> true 2').to.be.true;

    fl = 6*0.1;
    expect(auth.verifyCode([2,4,6]), 'fluctuation = 0.1 -> true 3').to.be.true;
    expect(auth.verifyCode([2+fl,4+fl,6]), 'fluctuation = 0.1 -> true 4').to.be.true;
    expect(auth.verifyCode([2-fl,4-fl,6]), 'fluctuation = 0.1 -> true 5').to.be.true;

    fl = 1.5*0.1;
    expect(auth.verifyCode([0.5,1,1.5]), 'fluctuation = 0.1 -> true 6').to.be.true;
    expect(auth.verifyCode([0.5+fl,1+fl,1.5]), 'fluctuation = 0.1 -> true 7').to.be.true;
    expect(auth.verifyCode([0.5-fl,1-fl,1.5]), 'fluctuation = 0.1 -> true 8').to.be.true;

    fl = 3*0.1+0.1;
    expect(auth.verifyCode([1+fl,2,3]), 'fluctuation = 0.1 -> false 1').to.be.false;
    expect(auth.verifyCode([1,2+fl,3]), 'fluctuation = 0.1 -> false 2').to.be.false;
    expect(auth.verifyCode([1,2-fl,3]), 'fluctuation = 0.1 -> false 3').to.be.false;

    auth.setFluctuation(0.05);
    fl = 3*0.05;
    expect(auth.verifyCode([1+fl,2,3]), 'fluctuation = 0.05 -> true 1').to.be.true;
    expect(auth.verifyCode([1-fl,2-fl,3]), 'fluctuation = 0.05 -> true 2').to.be.true;
    expect(auth.verifyCode([1-fl-0.1,2,3]), 'fluctuation = 0.05 -> false 1').to.be.false;
    expect(auth.verifyCode([1,2+fl+0.1,3]), 'fluctuation = 0.05 -> false 2').to.be.false;
  });

});
