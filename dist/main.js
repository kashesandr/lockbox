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
	
	var DEBUG_DEFAULT_CODE = [352.18447023809, 523.22069642856, 955.59352380951, 1151.93428571428, 1838.82752380952, 2025.70342857142];
	
	var App = {
	
	  run: function run() {
	
	    var auth = new _Auth.Auth();
	    var bluetooth = new _Devices.Bluetooth({ serialPort: _settings.settings.pin.bluetoothSerial });
	    var relay = new _Devices.Relay({ pin: _settings.settings.pin.relayPin });
	    var knockDevice = new _Devices.KnockDevice({ pin: _settings.settings.pin.knockPin });
	
	    var signalDetectionService = new _SignalDetection.SignalDetectionService();
	
	    var triggerRelay = function triggerRelay(relay) {
	      var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 400;
	
	      relay.set(0);
	      setTimeout(function () {
	        relay.set(1);
	      }, timeout);
	    };
	
	    var isReadyToSetUpNewCode = false;
	    bluetooth.onDataReceived(function (data) {
	      if (data === "set") {
	        isReadyToSetUpNewCode = true;
	      } else if (data === "open") {
	        triggerRelay(relay);
	      } else {
	        if (data.indexOf('fluctuation ') !== -1) {
	          var val = parseFloat(data.split(' ')[1]) || 0.05;
	          auth.setFluctuation(val);
	        }
	      }
	    });
	
	    var isFirstPress = true;
	    var firstPressTimestamp = 0;
	    knockDevice.onKnock(function (e) {
	
	      if (isFirstPress) {
	        firstPressTimestamp = new Date().getTime();
	        isFirstPress = false;
	      } else {
	        var timestamp = new Date().getTime();
	        var deltaTime = timestamp - firstPressTimestamp;
	        signalDetectionService.putTimestamp(deltaTime);
	      }
	    });
	
	    // TODO: set the code manually
	    auth.setCode(DEBUG_DEFAULT_CODE);
	
	    signalDetectionService.onSignalDetect(function (code) {
	
	      _logger.logger.log('code-detected', code);
	
	      if (isReadyToSetUpNewCode) {
	        // TODO: store new code in FlashEEPROM
	        // TODO: details https://www.espruino.com/FlashEEPROM
	        auth.setCode(code);
	        _logger.logger.log('new code has been set');
	        isReadyToSetUpNewCode = false;
	      } else {
	
	        var authenticated = auth.verifyCode(code);
	        _logger.logger.log('authenticated', authenticated);
	
	        if (authenticated) {
	          triggerRelay(relay);
	        }
	      }
	
	      isFirstPress = true;
	      firstPressTimestamp = 0;
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
	
	var DEFAULT_FLUCTUATION = 0.05;
	var FLUCTUATION_SHIFT = 0.01;
	
	var Auth = function () {
	  function Auth() {
	    _classCallCheck(this, Auth);
	
	    this.code = []; // storing key code, an array of timestamps
	    this.fluctuationPct = DEFAULT_FLUCTUATION;
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
	      var fluctuation = +(signalEnd * this.fluctuationPct + FLUCTUATION_SHIFT).toFixed(2);
	
	      var result = true;
	
	      this.code.forEach(function (codeItem, index) {
	        var codeItemNormalized = +(codeItem * coeff).toFixed(2);
	        var signalItem = code[index];
	
	        var gt = +parseFloat(codeItemNormalized + fluctuation).toFixed(2);
	        var lt = +parseFloat(codeItemNormalized - fluctuation).toFixed(2);
	
	        var withinRange = gt >= signalItem && lt <= signalItem;
	
	        if (!withinRange) result = false;
	      });
	
	      _logger.logger.log("Auth.verifyCode", result);
	      return result;
	    }
	  }, {
	    key: "setFluctuation",
	    value: function setFluctuation(val) {
	      _logger.logger.log("Auth.setFluctuation", val);
	      this.fluctuationPct = val || DEFAULT_FLUCTUATION;
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
	// let P2 = P2 || null;
	// let P3 = P3 || null;
	// let Serial3 = Serial3 || null;
	
	var settings = {
	  pin: {
	    knockPin: P2,
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
	exports.KnockDevice = exports.Relay = exports.Bluetooth = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _logger = __webpack_require__(3);
	
	var _Utils = __webpack_require__(6);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	_logger.logger.log('Devices.js');
	
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
	    var _this = this;
	
	    _classCallCheck(this, Bluetooth);
	
	    var serial = options.serialPort;
	    var rate = options.baudRate || DEFAULT_BAUD_RATE;
	    var debouceTimeout = options.debounceTimeout || DEFAULT_DEBOUNCE_TIMEOUT;
	    serial.setup(rate);
	
	    this.receivedDataArray = [];
	    this.onDataReceivedCallback = function () {};
	
	    this.onDataReceivedDebounced = (0, _Utils.debounce)(function () {
	      _this._onDataReceived();
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
	      _logger.logger.log("Bluetooth._onDataReceoved", data);
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
	 * Relay utility module
	 * example:
	 *
	
	 ```
	  import { Relay } from "./Devices";
	  let options = {
	    pin: <Object>, // e,g, P1
	  };
	  let relay = new Relay(options);
	
	  relay.set(1);
	  relay.set(true);
	  relay.set(0);
	  relay.set(false);
	
	 ```
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
	
	/**
	 * KnockDevice module
	 * example:
	 *
	 ```
	 import { KnockDevice } from "./Devices";
	 let options = {
	      pin: <Object>, // e,g, P1
	      setWatchOpts: <Object> // opts passed to setWatch fn
	    };
	 let knockDevice = new KnockDevice(options);
	 knockDevice.onKnock((e)=>{
	  // callback when knock
	 });
	 ```
	 *
	 */
	
	var KNOCK_DEVICE_SET_WATCH_OPTS_DEFAULT = {
	  repeat: true,
	  debounce: 20,
	  edge: 'rising'
	};
	var KNOCK_DEVICE_DEBOUNCE = 100;
	
	var KnockDevice = function () {
	  function KnockDevice(options) {
	    var _this2 = this;
	
	    _classCallCheck(this, KnockDevice);
	
	    _logger.logger.log("setup KnockDevice");
	    var pin = options.pin;
	    var setWatchOpts = options.setWatchOpts || KNOCK_DEVICE_SET_WATCH_OPTS_DEFAULT;
	    this.onKnockCallback = function () {};
	
	    // here we use KNOCK_DEVICE_DEBOUNCE
	    // in order to catch only first knocking
	    var shakeTimeout = void 0;
	    var watcher = function watcher(e) {
	      if (shakeTimeout) return;
	      _this2.onKnockEvent(e);
	      shakeTimeout = setTimeout(function () {
	        shakeTimeout = undefined;
	      }, KNOCK_DEVICE_DEBOUNCE);
	    };
	
	    setWatch(watcher, pin, setWatchOpts);
	  }
	
	  _createClass(KnockDevice, [{
	    key: "onKnockEvent",
	    value: function onKnockEvent(e) {
	      _logger.logger.log("KnockDevice onKnockEvent");
	      this.onKnockCallback(e);
	    }
	  }, {
	    key: "onKnock",
	    value: function onKnock(callback) {
	      this.onKnockCallback = callback || function () {};
	    }
	  }]);
	
	  return KnockDevice;
	}();
	
	exports.Bluetooth = Bluetooth;
	exports.Relay = Relay;
	exports.KnockDevice = KnockDevice;

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
	var SIGNALS_THRESHOLD = 30;
	
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
	     * @param timestamp
	     */
	
	  }, {
	    key: "putTimestamp",
	    value: function putTimestamp(timestamp) {
	      _logger.logger.log('SignalDetectionService.putTimestamp()', timestamp);
	      if (this.signalTimestamps.length > SIGNALS_THRESHOLD) return;
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