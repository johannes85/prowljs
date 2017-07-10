import * as Mocha from 'mocha';
import * as assert from 'assert';
import * as nock from 'nock';
import Prowl from '../../../main/ts/prowl/Prowl';

describe('Prowl', () => {

  let p: Prowl;

  let successAnswer: string = '<?xml version="1.0" encoding="UTF-8"?><prowl><success code="200" remaining="123" resetdate="456789"/></prowl>';
  let successRetrieveTokenAnswer: string = '<?xml version="1.0" encoding="UTF-8"?><prowl><success code="200" remaining="123" resetdate="456789"/><retrieve token="TOKEN" url="URL" /></prowl>';
  let successRetrieveApikeyAnswer: string = '<?xml version="1.0" encoding="UTF-8"?><prowl><success code="200" remaining="123" resetdate="456789"/><retrieve apikey="APIKEY" /></prowl>';
  let invalidApikeyAnswer: string = '<?xml version="1.0" encoding="UTF-8"?><prowl><error code="401">Invalid apikey</error></prowl>';

  before(() => {
    p = new Prowl();
  })

  describe('constructor', () => {

    it('should set the api endpoint', () => {
      let p = new Prowl('https://www.foo.bar');
      assert.equal(p.getApiEndpoint(), 'https://www.foo.bar');
    });

    it('should set the default api endpoint if not set', () => {
      let p = new Prowl();
      assert.equal(p.getApiEndpoint(), 'https://api.prowlapp.com/publicapi');
    });

  });

  describe('verify', () => {

    it('should build correct get request and parse answer', async () => {
      nock(p.getApiEndpoint())
        .get(/verify/)
        .reply((uri, requestBody) => {
          assert.equal(uri, '/publicapi/verify?apikey=valid');
          return [200, successAnswer];
        });
      let res = await p.verify('valid');
      assert.equal(res.valid, true);
      assert.equal(res.remainingCalls, 123);
      assert.equal(res.remainingCallsResetDate, 456789);
    });

    it('should return valid=false for an invalid apikey', async () => {
      nock(p.getApiEndpoint())
        .get(/verify/)
        .reply(401, invalidApikeyAnswer);

      let res = await p.verify('invalid');
      assert.equal(res.valid, false);
    });

  });

  describe('add', () => {

    it('should build correct post request and parse answer', async () => {
      nock(p.getApiEndpoint())
        .post(/add/)
        .reply((uri, requestBody) => {
          assert.equal(uri, '/publicapi/add');
          assert.equal(requestBody, 'apikey=valid&application=TestApp&event=Test&description=Test%20App%20Description');
          return [200, successAnswer];
        });
      let res = await p.add({
        apiKey: 'valid',
        application: 'TestApp',
        event: 'Test',
        description: 'Test App Description'
      });
      assert.equal(res.remainingCalls, 123);
      assert.equal(res.remainingCallsResetDate, 456789);
    });

  });

  describe('retrieveToken', () => {

    it('should build correct post request and parse answer', async () => {
      nock(p.getApiEndpoint())
        .get(/retrieve\/token/)
        .reply((uri, requestBody) => {
          assert.equal(uri, '/publicapi/retrieve/token?providerkey=provider_key');
          return [200, successRetrieveTokenAnswer];
        });
      let res = await p.retrieveToken('provider_key');
      assert.equal(res.token, 'TOKEN');
      assert.equal(res.url, 'URL');
      assert.equal(res.remainingCalls, 123);
      assert.equal(res.remainingCallsResetDate, 456789);
    });

  });

  describe('retrieveApikey', () => {

    it('should build correct post request and parse answer', async () => {
      nock(p.getApiEndpoint())
        .get(/retrieve\/apikey/)
        .reply((uri, requestBody) => {
          assert.equal(uri, '/publicapi/retrieve/apikey?providerkey=provider_key&token=token');
          return [200, successRetrieveApikeyAnswer];
        });
      let res = await p.retrieveApikey('provider_key', 'token');
      assert.equal(res.apikey, 'APIKEY');
      assert.equal(res.remainingCalls, 123);
      assert.equal(res.remainingCallsResetDate, 456789);
    });

  });

});