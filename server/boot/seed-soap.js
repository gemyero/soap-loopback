'use strict';

module.exports = app => {
  const {Soap} = app.models;
  Soap.findOne({name: 'app'}, (error, soapInstance) => {
    if (error) throw error;
    if (!soapInstance) {
      Soap.create({
        name: 'app',
        url: 'http://services.aonaware.com/DictService/DictService.asmx',
        wsdlUrl: 'http://services.aonaware.com/DictService/DictService.asmx?WSDL',
      }, (err, newSoapInstance) => {
        if (err) throw err;
        console.log('Copy this id and put in discover method:', newSoapInstance.id);
      });
    } else {
      console.log('Copy this id and put in discover method:', soapInstance.id);
    }
  });
};
