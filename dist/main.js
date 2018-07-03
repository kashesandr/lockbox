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
	
	var _Locker = __webpack_require__(1);
	
	var _Auth = __webpack_require__(6);
	
	var _logger = __webpack_require__(4);
	
	var _settings = __webpack_require__(5);
	
	_logger.logger.log('main.js');
	
	var locker = new _Locker.Locker(_settings.settings.pin);
	var auth = new _Auth.Auth();
	
	// TODO: set the code manually
	var DEFAULT_CODE = [189.81586904765, 380.28420238092, 591.84163095231, 1036.09701785712, 1266.62794642860, 1892.38363095244, 2117.92424404760];
	auth.setCode(DEFAULT_CODE);
	
	var isReadyToSetUpNewCode = false;
	
	locker.on('code-detected', function (code) {
	
	  _logger.logger.log('code-detected', code);
	
	  if (isReadyToSetUpNewCode) {
	    auth.setCode(code);
	    _logger.logger.log('new code has been set');
	    isReadyToSetUpNewCode = false;
	  } else {
	    var authenticated = auth.verifyCode(code);
	    _logger.logger.log('authenticated', authenticated);
	    locker.servo.move(authenticated ? 0 : 1);
	  }
	});
	
	locker.on('set-new-code', function () {
	  _logger.logger.log('ready to set up new code');
	  isReadyToSetUpNewCode = true;
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Locker = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _Utils = __webpack_require__(2);
	
	var _Devices = __webpack_require__(3);
	
	var _logger = __webpack_require__(4);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	_logger.logger.log('Locker.js');
	
	var Locker = function () {
	  function Locker(options) {
	    _classCallCheck(this, Locker);
	
	    this.events = {};
	
	    servoPin = options.servoPin;
	    buttonPin = options.buttonPin;
	    bluetoothSerial = options.bluetoothSerial;
	
	
	    this.servo = this.setupServo(servoPin);
	    this.button = this.setupButton(buttonPin);
	    this.bluetooth = this.setupBluetooth(bluetoothSerial);
	  }
	
	  _createClass(Locker, [{
	    key: "setupButton",
	    value: function setupButton(pin) {
	      var _this = this;
	
	      _logger.logger.log("setupButton");
	
	      var isFirstPress = false;
	      var firstPressTimestamp = null;
	      var signalTimestamps = [];
	      var detection = function detection() {
	        _logger.logger.log("setupButton detection");
	        isFirstPress = true;
	        var cb = _this.events['code-detected'] || function () {};
	        cb(signalTimestamps);
	        signalTimestamps = [];
	        firstPressTimestamp = null;
	      };
	      var detectionDebounced = (0, _Utils.debounce)(detection, 2000);
	
	      function btnClick(e) {
	
	        _logger.logger.log("setupButton btnClick");
	
	        if (isFirstPress) {
	          firstPressTimestamp = new Date().getTime();
	          isFirstPress = false;
	        } else {
	          var timestamp = new Date().getTime();
	          var deltaTime = timestamp - firstPressTimestamp;
	          signalTimestamps.push(deltaTime);
	          detectionDebounced();
	        }
	      }
	
	      // TODO: setWatch doesn't work after reloading
	      setWatch(btnClick, pin, { repeat: true, debounce: 20, edge: 'rising' });
	
	      return pin;
	    }
	  }, {
	    key: "setupServo",
	    value: function setupServo(pin) {
	      var servo = new _Devices.Servo(pin);
	      return servo;
	    }
	  }, {
	    key: "setupBluetooth",
	    value: function setupBluetooth(serial) {
	      var _this2 = this;
	
	      serial.setup(9600);
	
	      var receivedDataArray = [];
	      var finishDebounced = (0, _Utils.debounce)(function () {
	        _this2.events['bluetooth-data-received'](receivedDataArray.join(""));
	        receivedDataArray = [];
	      }, 100);
	
	      serial.on('data', function (data) {
	        receivedDataArray.push(data);
	        finishDebounced();
	      });
	
	      this.on('bluetooth-data-received', function (data) {
	
	        if (data === "set") {
	          _this2.events['set-new-code']();
	        }
	      });
	    }
	  }, {
	    key: "on",
	    value: function on(eventName, callback) {
	      this.events[eventName] = callback;
	    }
	  }]);
	
	  return Locker;
	}();
	
	exports.Locker = Locker;

/***/ },
/* 2 */
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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Servo = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       Servo motor utility module
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       example:
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       ```
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         import { Servo } from "./Devices";
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         let servo = new Servo(P3);
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         s.move(1); // moving to position 1 over 1 second
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         s.move(0); // moving to position 0 over 1 second
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         s.move(0.5, 3000); // moving to position 0.5 over 3 seconds
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         // moving to position 0 over 1 second, then move to position 1
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         s.move(0, 1000, function() {
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           s.move(1, 1000);
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         });
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       ```
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */
	
	var _logger = __webpack_require__(4);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	_logger.logger.log('Devices.js');
	
	var DEFAULT_DURATION = 1000;
	var DEFAULT_INTERVAL = 20;
	var Servo = function () {
	  function Servo(pin, options) {
	    _classCallCheck(this, Servo);
	
	    this.pin = pin;
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
	
	      if (!duration) duration = DEFAULT_DURATION;
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
	        amt += 1000.0 / (DEFAULT_INTERVAL * duration);
	      };
	
	      this.currentInterval = setInterval(moveFn, DEFAULT_INTERVAL);
	    }
	  }]);
	
	  return Servo;
	}();
	
	exports.Servo = Servo;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.logger = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _settings = __webpack_require__(5);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Logger = function () {
	  function Logger(bluetoothSerial) {
	    _classCallCheck(this, Logger);
	
	    this.bluetoothSerial = bluetoothSerial;
	  }
	
	  _createClass(Logger, [{
	    key: 'log',
	    value: function log(message, arg) {
	      // let txt = `${message}: ${arg}`;
	      // if (console && console.log)
	      //   console.log(txt);
	      // if (this.bluetoothSerial)
	      //   this.bluetoothSerial.print(txt);
	    }
	  }]);
	
	  return Logger;
	}();
	
	var logger = new Logger(_settings.settings.pin.bluetoothSerial);
	
	exports.logger = logger;

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var settings = {
	  pin: {
	    buttonPin: BTN1,
	    servoPin: P3,
	    bluetoothSerial: Serial3
	  }
	};
	
	exports.settings = settings;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Auth = undefined;
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _logger = __webpack_require__(4);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	_logger.logger.log('Auth.js');
	
	var Auth = function () {
	  function Auth() {
	    _classCallCheck(this, Auth);
	
	    this.code = []; // storing key code, an array of timestamps
	    this.fluctuation = 150;
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

/***/ }
/******/ ])
});
;
//# sourceMappingURL=main.js.map