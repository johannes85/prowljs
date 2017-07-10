import Prowl, { 
  IVerifyResult, 
  IAddResult, 
  IRetrieveTokenResult,
  IRetrieveApikeyResult,
  Priority 
} from '../Prowl';

(async () => {
  let p = new Prowl();
  try {
    let verifyResult = await p.verify('063e0b61a450ad1568c2433dc8405ff0c0a2cb9b');
    console.log(verifyResult);
    let addResult: IAddResult = await p.add({
      apiKey: '063e0b61a450ad1568c2433dc8405ff0c0a2cb9b',
      application: 'TestApp',
      event: 'Test',
      description: 'Test App Description',
      priority: Priority.Emergency,
      url: 'http://www.google.de'
    });
    console.log(addResult);
  } catch (error) {
    console.error('Unknown error');
    console.error(error);
  }
})();