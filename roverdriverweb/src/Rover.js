class Rover {

    constructor() {
      this.device = null;
      this.onDisconnected = this.onDisconnected.bind(this);
    }
    
    request() {
      let options = {
        "filters": [{
          "namePrefix": "rover-",
          "services": ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"]
        }],
        "optionalServices": ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"]
      };
      return navigator.bluetooth.requestDevice(options)
      .then(device => {
        this.device = device;
        this.device.addEventListener('gattserverdisconnected', this.onDisconnected);
      });
    }
    
    connect() {
      if (!this.device) {
        return Promise.reject('Device is not connected.');
      }
      return this.device.gatt.connect();
    }
    
    getDevice() {
        return this.device;
    }

    startTxNotifications(listener) {
      return this.device.gatt.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e")
      .then(service => service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e"))
      .then(characteristic => characteristic.startNotifications())
      .then(characteristic => characteristic.addEventListener('characteristicvaluechanged', listener));
    }
  
    stopTxNotifications(listener) {
      return this.device.gatt.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e")
      .then(service => service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e"))
      .then(characteristic => characteristic.stopNotifications())
      .then(characteristic => characteristic.removeEventListener('characteristicvaluechanged', listener));
    }
  
    disconnect() {
      if (!this.device) {
        return Promise.reject('Cannot disconnect, device is not connected.');
      }
      return this.device.gatt.disconnect();
    }
  
    onDisconnected() {
      console.log('Device is disconnected.');
    }
  }

  export default Rover;
