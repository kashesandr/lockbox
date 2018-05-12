import lockbox from '../../src/lockbox';

describe('lockbox', () => {
  describe('Greet function', () => {
    beforeEach(() => {
      spy(lockbox, 'greet');
      lockbox.greet();
    });

    it('should have been run once', () => {
      expect(lockbox.greet).to.have.been.calledOnce;
    });

    it('should have always returned hello', () => {
      expect(lockbox.greet).to.have.always.returned('hello');
    });
  });
});
