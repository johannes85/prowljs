## Node.js Library for Accessing Prowl

[![Build Status](https://travis-ci.org/johannes85/prowljs.svg?branch=master)](https://travis-ci.org/johannes85/prowljs)

This library supports all API endpoints provided by Prowl:
  * add
  * verify
  * retrieve/token
  * retrieve/apikey

It's written in TypeScript and is optimized for using async and await.

### Example in TypeScript with async await
```typescript
import Prowl, { IAddResult, Priority } from 'prowljs';

(async () => {
  let p = new Prowl();
  try {
    let addResult: IAddResult = await p.add({
      apiKey: '...',
      application: 'TestApp',
      event: 'Test',
      description: 'Test App Description',
      priority: Priority.Emergency,
      url: 'http://www.foo.bar'
    });
    console.log(addResult);
  } catch (error) {
    console.error(error);
  }
})();
```

### Example in JavaScript with Promises
```javascript
const prowl = require('prowljs');

let p = new prowl.default();
p.add({
  apiKey: '...',
  application: 'TestApp',
  event: 'Test',
  description: 'Test App Description',
  priority: prowl.Priority.Emergency,
  url: 'http://www.foo.bar'
}).then((addResult) => {
  console.log(addResult);
}).catch((error) => {
  console.error(error);
});
```