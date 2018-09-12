'use strict';
// const soap = require('soap'); // comment to see strong-soap object

const promisifiedEvent = (emitter, event) => {
  const promise = new Promise((resolve, reject) => {
    emitter.once(event, resolve);
    emitter.once('error', reject);
  });
  return promise;
};

module.exports = function(Soap) {
  Soap.prototype.discover = async function discover() {
    let soapDs;
    try {
      soapDs = Soap.app.dataSource('soapDs', {
        connector: 'loopback-connector-soap',
        url: this.url,
        wsdl: this.wsdlUrl,
      });
      await promisifiedEvent(soapDs, 'connected');
      const promise = ds => new Promise((resolve, reject) => {
        ds.connector.connect((err, client) => {
          if (err) reject(err);
          resolve(client);
        });
      });
      await promise(soapDs);
      const result = soapDs.connector.client.describe(); // comment to see node-soap object

      // comment to see strong-soap object
      // const client = await soap.createClientAsync(this.wsdl_url);
      // const result = client.describe();  

      return result;
    } finally {
      await soapDs.disconnect();
    }
  };

  Soap.remoteMethod(
    'discover',
    {
      isStatic: false,
      accepts: [],
      returns: { arg: 'result', type: 'object', root: true },
      http: { path: '/discover', verb: 'get' },
    },
  );
};
