var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyACM0", {
  baudrate: 9600
});
