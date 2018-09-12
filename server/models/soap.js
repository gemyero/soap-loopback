'use strict';

const promisifiedEvent = (emitter, event) => {
  const promise = new Promise((resolve, reject) => {
    emitter.once(event, resolve);
    emitter.once('error', reject);
  });
  return promise;
};

module.exports = function(Soap) {
  Soap.discover = async (id) => {
    const soap_instance = await Soap.findById(id);
    if (!soap_instance) throw new Error('No soap datasource found!');
    try {
      const soapDs = Soap.app.dataSource('soapDs', {
        connector: 'loopback-connector-soap',
        url: soap_instance.url,
        wsdl: soap_instance.wsdl_url,
        remoteEnabled: true
      });
      await promisifiedEvent(soapDs, 'connected');
      const model = soapDs.createModel('soapTest', {});

      // model.DefineFunction = async (word) => {
      //   const result = await model.Define({ word });
      //   console.log(result);
      //   return result;
      // };

      // model.remoteMethod('DefineFunction', {
      //   accepts: { arg: 'word', type: 'string' },
      //   returns: { arg: 'result', type: 'object', root: true }
      // });

      Soap.app.model(model, {
        dataSource: soapDs,
        public: true
      });

      const promise = (ds) => new Promise((resolve, reject) => {
        ds.connector.connect((err, client) => {
          if (err) reject(err);
          resolve(client);
        });
      });

      const client = await promise(soapDs);
      const calls = await client.describe();
      return calls;
    } catch (error) {
      console.log(error);
    }
  };

  Soap.remoteMethod('discover', {
    accepts: { arg: 'id', type: 'string' },
    returns: { arg: 'soap', type: 'object' }
  });
};
