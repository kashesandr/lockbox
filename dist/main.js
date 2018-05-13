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
	
	var _Utils = __webpack_require__(1);
	
	var isFirstPress = false;
	var firstPressTimestamp = null;
	var signalTimestamps = [];
	
	var finishDetection = function finishDetection() {
	  isFirstPress = true;
	  lockUnlock(signalTimestamps);
	  signalTimestamps = [];
	};
	var finishDetectionDebounced = (0, _Utils.debounce)(finishDetection, 2000);
	
	function btnClick() {
	
	  if (isFirstPress) {
	    firstPressTimestamp = new Date();
	    isFirstPress = false;
	  } else {
	    var timestamp = new Date();
	    var deltaTime = timestamp - firstPressTimestamp;
	    finishDetectionDebounced();
	    signalTimestamps.push(deltaTime);
	  }
	}
	
	function lockUnlock(code) {
	  console.log(code);
	}
	
	setWatch(btnClick, BTN1, { repeat: true, edge: "rising" });

/***/ },
/* 1 */
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

/***/ }
/******/ ])
});
;
//# sourceMappingURL=main.js.map