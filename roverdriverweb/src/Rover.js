class Rover {

  constructor() {
    this.device = null;
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
        //this.device.addEventListener('gattserverdisconnected', this.onDisconnected);
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
    //console.log("Sending " + message);
    return message;
  }

  queueSubject(subject) {
    var data = new (Uint8Array)([this.enc.encode("!"), subject]);
    MessageQueue.enqueue(() => this.writeRX(this.appendChecksum(data)));
  }

  queueKey(subject, content) {
    // Set a placeholder byte (0) for where the subject goes
    let data = this.enc.encode("!0" + content);
    data.set([subject], 1); // replace the second byte with the subject
    MessageQueue.enqueue(() => this.writeRX(this.appendChecksum(data)));
  }

  queueMessage(subject, content) {
    var dataArray = [this.enc.encode("!"), subject];
    content = this.enc.encode(content.toString());
    for (var i = 0; i < content.length; i++) {
      dataArray.push(content[i]);
    }    
    dataArray.push(0x00);
    //content = this.enc.encode(content);
    // pad with 0 as a null terminating character
    var data = new (Uint8Array)(dataArray);
    MessageQueue.enqueue(() => this.writeRX(this.appendChecksum(data)));
  }

  writeRX(data) {
    return this.device.gatt.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e")
      .then(service => service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e"))
      .then(characteristic => characteristic.writeValue(data))
      .then(() => new Promise(r => setTimeout(() => {
        r();
    }, 50)))
      .catch(e => {
        if (e.name === "NetworkError") {
          // Consider raising a more immediate alert here
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

  /*onDisconnected() {
    console.log('Device is disconnected.');
  }*/
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
