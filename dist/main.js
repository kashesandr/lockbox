(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["main"] = factory();
	else
		root["main"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _App = __webpack_require__(1);
	
	_App.App.run();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.App = undefined;
	
	var _Auth = __webpack_require__(2);
	
	var _logger = __webpack_require__(3);
	
	var _settings = __webpack_require__(4);
	
	var _Devices = __webpack_require__(5);
	
	var _SignalDetection = __webpack_require__(7);
	
	_logger.logger.log('main.js');
	
	var DEBUG_DEFAULT_CODE = [0.11071835714, 0.08259338095, 0.10016359523, 0.30911060714, 0.09569125595, 0.51507855357, 0.07772857142];
	
	var App = {
	
	  run: function run() {
	
	    var isReadyToSetUpNewCode = false;
	
	    var auth = new _Auth.Auth();
	    var button = new _Devices.Button({ pin: _settings.settings.pin.buttonPin });
	    var bluetooth = new _Devices.Bluetooth({ serialPort: _settings.settings.pin.bluetoothSerial });
	    var relay = new _Devices.Relay({ pin: _settings.settings.pin.relayPin });
	
	    var signalDetectionService = new _SignalDetection.SignalDetectionService();
	
	    bluetooth.onDataReceived(function () {
	      _logger.logger.log('ready to set up new code');
	      isReadyToSetUpNewCode = true;
	    });
	
	    button.onClick(function (e) {
	      // todo: generate timestamp based on `e` arg
	      // there is a mistake (e.time - e.lastTime) -> fix it
	      var timestamp = e.time - e.lastTime;
	      signalDetectionService.putTimestamp(timestamp);
	    });
	
	    // TODO: set the code manually
	    auth.setCode(DEBUG_DEFAULT_CODE);
	
	    signalDetectionService.onSignalDetect(function (code) {
	
	      _logger.logger.log('code-detected', code);
	
	      if (isReadyToSetUpNewCode) {
	        auth.setCode(code);
	        _logger.logger.log('new code has been set');
	        isReadyToSetUpNewCode = false;
	      } else {
	        var authenticated = auth.verifyCode(code);
	        _logger.logger.log('authenticated', authenticated);
	
	        if (authenticated) {
	          relay.set(0);
	          setTimeout(function () {
	            relay.set(1);
	          }, 400);
	        }
	      }
	    });
	  }
	
	};
	
	exports.App = App;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Auth = undefined;
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _logger = __webpack_require__(3);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	_logger.logger.log('Auth.js');
	
	var Auth = function () {
	  function Auth() {
	    _classCallCheck(this, Auth);
	
	    this.code = []; // storing key code, an array of timestamps
	    this.fluctuation = 150; // TODO: must be in percents
	  }
	
	  _createClass(Auth, [{
	    key: "setCode",
	    value: function setCode(code) {
	      if (!code) return;
	      if (!(code instanceof Array)) return;
	      this.code = code;
	    }
	  }, {
	    key: "getCode",
	    value: function getCode() {
	      return this.code;
	    }
	  }, {
	    key: "verifyCode",
	    value: function verifyCode(code) {
	      if (!code) return false;
	      if (!(code instanceof Array)) return false;
	      if (code.length !== this.code.length) return false;
	
	      var _code$slice = code.slice(-1),
	          _code$slice2 = _slicedToArray(_code$slice, 1),
	          signalEnd = _code$slice2[0];
	
	      var _code$slice3 = this.code.slice(-1),
	          _code$slice4 = _slicedToArray(_code$slice3, 1),
	          codeEnd = _code$slice4[0];
	
	      var coeff = signalEnd / codeEnd;
	      var result = true;
	      var fluctuation = this.fluctuation;
	      this.code.forEach(function (codeItem, index) {
	        var stamp = code[index] / coeff;
	        var withinRange = stamp + fluctuation >= codeItem && stamp - fluctuation <= codeItem;
	        if (!withinRange) result = false;
	      });
	
	      return result;
	    }
	  }]);
	
	  return Auth;
	}();
	
	exports.Auth = Auth;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.logger = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _settings = __webpack_require__(4);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * Simplest silly logger for debugging
	 *
	 * Actually there is a bug with it.
	 * For some reason the app is unstable when
	 * something is pushed into console.log,
	 * as I found - Espruino waits for recipients for logged data
	 * and breaks logic if there are no ones
	 *
	 * @type {Logger}
	 */
	var Logger = function () {
	  function Logger(bluetoothSerial) {
	    _classCallCheck(this, Logger);
	
	    this.isEnabled = false;
	    this.bluetoothSerial = bluetoothSerial;
	  }
	
	  _createClass(Logger, [{
	    key: 'log',
	    value: function log(message, arg) {
	      if (!this.isEnabled) return false;
	      var txt = message + ': ' + arg;
	      if (console && console.log) console.log(txt);
	      if (this.bluetoothSerial) this.bluetoothSerial.print(txt);
	    }
	  }, {
	    key: 'enabled',
	    value: function enabled(bool) {
	      this.isEnabled = bool;
	    }
	  }]);
	
	  return Logger;
	}();
	
	var logger = new Logger(_settings.settings.pin.bluetoothSerial);
	
	// TODO: enable when debugging
	//logger.enabled(true);
	
	exports.logger = logger;

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	// mocking for testing
	// TODO: do not include in prod
	// let BTN1 = BTN1 || null;
	// let P3 = P3 || null;
	// let Serial3 = Serial3 || null;
	
	var settings = {
	  pin: {
	    buttonPin: P2,
	    relayPin: P3,
	    bluetoothSerial: Serial3
	  }
	};
	
	exports.settings = settings;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Relay = exports.Bluetooth = exports.Button = exports.Servo = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Servo motor utility module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * example:
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       ```
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         import { Servo } from "./Devices";
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         let options = {
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           pin: <Object>, // e,g, P1
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         };
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         let servo = new Servo(options);
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         s.move(1); // moving to position 1 over 1 second
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         s.move(0); // moving to position 0 over 1 second
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         s.move(0.5, 3000); // moving to position 0.5 over 3 seconds
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         // moving to position 0 over 1 second, then move to position 1
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         s.move(0, 1000, function() {
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           s.move(1, 1000);
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         });
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       ```
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */
	
	var _logger = __webpack_require__(3);
	
	var _Utils = __webpack_require__(6);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	_logger.logger.log('Devices.js');
	
	var SERVO_DEFAULT_DURATION = 1000;
	var SERVO_DEFAULT_INTERVAL = 20;
	
	// TODO: remove since it is deprecated
	var Servo = function () {
	  function Servo(options) {
	    _classCallCheck(this, Servo);
	
	    this.pin = options.pin;
	    this.currentInterval = null;
	    this.currentPosition = null;
	    if (options && options.range) {
	      this.range = options.range;
	      this.offset = 1.5 - options.range / 2;
	    } else {
	      this.offset = 1;
	      this.range = 1;
	    }
	  }
	
	  _createClass(Servo, [{
	    key: "move",
	    value: function move(position, duration, cb) {
	      var _this = this;
	
	      if (!duration) duration = SERVO_DEFAULT_DURATION;
	      if (!this.currentPosition) this.currentPosition = position;
	      if (this.currentInterval) clearInterval(this.currentInterval);
	
	      var initialPosition = this.currentPosition;
	      var amt = 0;
	
	      var moveFn = function moveFn() {
	
	        if (amt > 1) {
	          clearInterval(_this.currentInterval);
	          delete _this.currentInterval;
	          amt = 1;
	          if (cb) cb();
	        }
	        _this.currentPosition = position * amt + initialPosition * (1 - amt);
	        digitalPulse(_this.pin, 1, _this.offset + E.clip(_this.currentPosition, 0, 1) * _this.range);
	        amt += 1000.0 / (SERVO_DEFAULT_INTERVAL * duration);
	      };
	
	      this.currentInterval = setInterval(moveFn, SERVO_DEFAULT_INTERVAL);
	    }
	  }]);
	
	  return Servo;
	}();
	
	/**
	 * Button module
	 * example: 
	 *
	  ```
	    import { Button } from "./Devices";
	    let options = {
	      pin: <Object>, // e,g, P1
	      setWatchOpts: <Object> // opts passed to setWatch fn
	    };
	    let btn = new Button(options);
	 ```
	 * 
	 */
	
	var SET_WATCH_OPTS_DEFAULT = {
	  repeat: true,
	  debounce: 20,
	  edge: 'rising'
	};
	
	var Button = function () {
	  function Button(options) {
	    _classCallCheck(this, Button);
	
	    _logger.logger.log("setupButton");
	    var pin = options.pin;
	    var setWatchOpts = options.setWatchOpts || SET_WATCH_OPTS_DEFAULT;
	    setWatch(this.btnClick.bind(this), pin, setWatchOpts);
	  }
	
	  _createClass(Button, [{
	    key: "btnClick",
	    value: function btnClick(e) {
	      _logger.logger.log("setupButton btnClick");
	      this.btnClickCallback(e);
	    }
	  }, {
	    key: "onClick",
	    value: function onClick(callback) {
	      this.btnClickCallback = callback || function () {};
	    }
	  }]);
	
	  return Button;
	}();
	
	/**
	 * Bluetooth module
	 * example:
	 *
	  ```
	    import { Bluetooth } from "./Devices";
	    let options = {
	      serialPort: <Object> // e.g. Serial3
	      baudRate: <Number> // e.g. 9600 <- this is default
	      debounceTimeout: <Number> // e.g. 100 <- this is default
	    };
	    let bluetooth = new Bluetooth(options);
	  ```
	 *
	 */
	var DEFAULT_BAUD_RATE = 9600;
	var DEFAULT_DEBOUNCE_TIMEOUT = 100;
	
	var Bluetooth = function () {
	  function Bluetooth(options) {
	    var _this2 = this;
	
	    _classCallCheck(this, Bluetooth);
	
	    var serial = options.serialPort;
	    var rate = options.baudRate || DEFAULT_BAUD_RATE;
	    var debouceTimeout = options.debounceTimeout || DEFAULT_DEBOUNCE_TIMEOUT;
	    serial.setup(rate);
	
	    this.receivedDataArray = [];
	    this.onDataReceivedCallback = function () {};
	
	    this.onDataReceivedDebounced = (0, _Utils.debounce)(function () {
	      _this2._onDataReceived();
	    }, debouceTimeout);
	
	    serial.on('data', this.onDataReceiving.bind(this));
	  }
	
	  _createClass(Bluetooth, [{
	    key: "onDataReceiving",
	    value: function onDataReceiving(data) {
	      this.receivedDataArray.push(data);
	      this.onDataReceivedDebounced();
	    }
	  }, {
	    key: "_onDataReceived",
	    value: function _onDataReceived() {
	      var data = this.receivedDataArray.join("");
	      this.onDataReceivedCallback(data);
	      this.receivedDataArray = [];
	    }
	  }, {
	    key: "onDataReceived",
	    value: function onDataReceived(callback) {
	      this.onDataReceivedCallback = callback || function () {};
	    }
	  }]);
	
	  return Bluetooth;
	}();
	
	/**
	 *
	 */
	
	var Relay = function () {
	  function Relay(options) {
	    _classCallCheck(this, Relay);
	
	    this.pin = options.pin;
	  }
	
	  _createClass(Relay, [{
	    key: "set",
	    value: function set(bool) {
	      this.pin.write(bool ? 1 : 0);
	    }
	  }]);
	
	  return Relay;
	}();
	
	exports.Servo = Servo;
	exports.Button = Button;
	exports.Bluetooth = Bluetooth;
	exports.Relay = Relay;

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var debounce = function debounce(func, wait, immediate) {
	  var timeoutId = null;
	  return function () {
	    var context = this,
	        args = arguments;
	    var later = function later() {
	      timeoutId = null;
	      if (!immediate) func.apply(context, args);
	    };
	    var callNow = immediate && !timeoutId;
	    if (timeoutId) clearTimeout(timeoutId);
	    timeoutId = setTimeout(later, wait);
	    if (callNow) func.apply(context, args);
	  };
	};
	
	exports.debounce = debounce;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.SignalDetectionService = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _logger = __webpack_require__(3);
	
	var _Utils = __webpack_require__(6);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	_logger.logger.log('signal-detection.js', 'loaded');
	
	/**
	 *
	 * Service that helps to putTimestamp timestamped code
	 *
	 */
	
	var CODE_DETECT_TIMEOUT_DEFAULT = 2000;
	
	var SignalDetectionService = function () {
	  function SignalDetectionService() {
	    _classCallCheck(this, SignalDetectionService);
	
	    this.codeDetectionTimeout = CODE_DETECT_TIMEOUT_DEFAULT;
	    this.signalTimestamps = [];
	    this.signalDetectionInProgress = false;
	
	    this.updateCodeDetectionDebounced();
	  }
	
	  _createClass(SignalDetectionService, [{
	    key: "updateCodeDetectionDebounced",
	    value: function updateCodeDetectionDebounced() {
	      var codeDetectionTimeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.codeDetectionTimeout || CODE_DETECT_TIMEOUT_DEFAULT;
	
	      _logger.logger.log('SignalDetectionService.updateCodeDetectionDebounced()', codeDetectionTimeout);
	      this.detectCodeDebounced = (0, _Utils.debounce)(this.onCodeDetected.bind(this), codeDetectionTimeout);
	    }
	
	    /**
	     * todo: define input, modify the `e` variable taken from espruino's `setWatch` fn
	     * @param timestamp
	     */
	
	  }, {
	    key: "putTimestamp",
	    value: function putTimestamp(timestamp) {
	      _logger.logger.log('SignalDetectionService.putTimestamp()', timestamp);
	      if (this.signalDetectionInProgress) {
	        this.signalTimestamps.push(timestamp);
	      }
	      this.signalDetectionInProgress = true;
	      this.detectCodeDebounced();
	    }
	  }, {
	    key: "onCodeDetected",
	    value: function onCodeDetected() {
	      _logger.logger.log("SignalDetectionService.onCodeDetected", 'called');
	
	      var callback = this.onSignalDetectCallback || function () {};
	      callback(this.signalTimestamps);
	
	      this.signalTimestamps = [];
	      this.signalDetectionInProgress = false;
	    }
	  }, {
	    key: "onSignalDetect",
	    value: function onSignalDetect(callback) {
	      this.onSignalDetectCallback = callback; // todo check context
	    }
	  }, {
	    key: "setDetectionTimeout",
	    value: function setDetectionTimeout(timeout) {
	      this.codeDetectionTimeout = timeout;
	      this.updateCodeDetectionDebounced();
	    }
	  }, {
	    key: "getTimestamps",
	    value: function getTimestamps() {
	      return this.signalTimestamps;
	    }
	  }]);
	
	  return SignalDetectionService;
	}();
	
	exports.SignalDetectionService = SignalDetectionService;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=main.js.map