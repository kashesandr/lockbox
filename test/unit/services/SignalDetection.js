import { SignalDetectionService } from '../../../src/services/SignalDetection';

describe('SignalDetectionService', () => {

  let service = null;
  beforeEach(()=>{
    service = new SignalDetectionService();
  });
  afterEach(()=>{
    service = null;
  });

  it('class should exist', () => {
    return expect(service).to.exist;
  });

  it('should have method responsible for signal detection', () => {
    expect(service.putTimestamp).to.exist;

    expect(service.signalDetectionInProgress).to.equal(false, 'detection not started');

    service.putTimestamp();
    expect(service.signalDetectionInProgress).to.equal(true, 'detection in progress');

    service.putTimestamp(200);
    service.putTimestamp(400);

    const expected = [200, 400];
    expect(service.signalTimestamps).to.deep.equal(expected, 'correct timestamps');

  });

  it('should have method that is fired when signal detected (timeout = 500)', (done) => {
    service.setDetectionTimeout(500);

    expect(service.onCodeDetected).to.exist;
    let spy = sinon.spy(service, 'onCodeDetected');

    service.putTimestamp();
    service.putTimestamp(200);
    service.putTimestamp(400);

    setTimeout( () => {
      let timestamps = service.getTimestamps();
      expect(timestamps).to.deep.equal([], 'timestamps are cleared');
      expect(service.signalDetectionInProgress).to.equal(false, 'detection completed');
      done();
    }, 1500);

  });

  xit('`onCodeDetected` fires an event that contains timestamps', () => {
    let spy = sinon.spy(service, '<???>');
    service.putTimestamp();
    service.putTimestamp(200);
    service.putTimestamp(400);
    service.onCodeDetected();
  });

  xit('', () => {} );

  xit('', () => {} );

});
