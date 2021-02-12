class Rover {

  constructor() {
    this.device = null;
    this.onDisconnected = this.onDisconnected.bind(this);
    this.enc = new TextEncoder();
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

  appendChecksum(data) {
    var checksum = 0,                               // initialize to 0
      i = 0, length = data.length;
    while (i < length) checksum += data[i++];   // add all
    checksum = ((~checksum >>> 0) & 0xff);
    var message = new (data.constructor)(data.length + 1);
    message.set(data, 0);
    message.set([checksum], data.length);
    return message;
  }

  queueSubject(subject) {
    var data = new (Uint8Array)(2);
    data.set(this.enc.encode("!"), 0);
    data.set([subject], 1);

    MessageQueue.enqueue(() => this.writeRX(this.appendChecksum(data)));
  }

  queueMessage(subject, content) {
    let data = this.enc.encode("!" + subject + content);

    MessageQueue.enqueue(() => this.writeRX(this.appendChecksum(data)));
  }

  writeRX(data) {
    // console.log(data);
    return this.device.gatt.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e")
      .then(service => service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e"))
      .then(characteristic => characteristic.writeValue(data))
      .catch(e => {
        if (e.name === "NetworkError") {
          console.log("Known: " + e);
        } else {
          console.log("Unknown: " + e);
        }
      });
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

class MessageQueue {
  static queue = [];
  static pendingPromise = false;
  static stop = false;

  static enqueue(promise) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        promise,
        resolve,
        reject,
      });
      this.dequeue();
    });
  }

  static dequeue() {
    if (this.workingOnPromise) {
      return false;
    }
    if (this.stop) {
      this.queue = [];
      this.stop = false;
      return;
    }
    const item = this.queue.shift();
    if (!item) {
      return false;
    }
    try {
      this.workingOnPromise = true;
      item.promise()
        .then((value) => {
          this.workingOnPromise = false;
          item.resolve(value);
          this.dequeue();
        })
        .catch(err => {
          this.workingOnPromise = false;
          item.reject(err);
          this.dequeue();
        })
    } catch (err) {
      this.workingOnPromise = false;
      item.reject(err);
      this.dequeue();
    }
    return true;
  }
}
