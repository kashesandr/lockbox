import { Auth } from '../../src/services/Auth';

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
      expect(auth.fluctuation).to.equal(150);
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

    let fluctuation = 0.1;
    expect(auth.verifyCode([2+fluctuation,4+fluctuation,6+fluctuation])).to.be.true;
    expect(auth.verifyCode([2-fluctuation,4-fluctuation,6-fluctuation])).to.be.true;
  });

  xit('', ()=>{  });

});
