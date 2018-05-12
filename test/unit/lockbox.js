import Locker from '../../src/Locker';

describe('Locker', () => {

  let locker = null;
  beforeEach(()=>{
    locker = new Locker();
  });
  afterEach(()=>{
    locker = null;
  });

  it('class should exist', () => {
    return expect(Locker).to.exist;
  });

  it('can be initialized', () => {
    let locker = new Locker();
    return expect(locker).to.exist;
  });

  describe('when just initialized', () => {

    it('should have empty code', ()=>{
      expect(locker.code).to.deep.equal([]);
    });

    it('should have set up fluctuation', ()=>{
      expect(locker.fluctuation).to.equal(0.1);
    });

  });

  it('can set/get code', ()=>{
    expect(locker.setCode).to.exist;

    locker.setCode();
    expect(locker.getCode()).to.deep.equal([]);

    locker.setCode(1);
    expect(locker.getCode()).to.deep.equal([]);

    locker.setCode([1,2,3]);
    expect(locker.getCode()).to.deep.equal([1,2,3]);
  });

  it('can verify code with existing', ()=>{
    expect(locker.verifyCode).to.exist;

    locker.setCode([1,2,3]);
    expect(locker.verifyCode([1,2,3])).to.equal(true, 'same code');

    expect(locker.verifyCode([1,2])).to.equal(false, 'less length');

    expect(locker.verifyCode([2,4,6])).to.equal(true, 'same code but 2 times slower');

    let fluctuation = 0.1;
    expect(locker.verifyCode([2+fluctuation,4+fluctuation,6+fluctuation])).to.be.true;
    expect(locker.verifyCode([2-fluctuation,4-fluctuation,6-fluctuation])).to.be.true;
  });

  xit('', ()=>{  });

});
