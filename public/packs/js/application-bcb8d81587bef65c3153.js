/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/packs/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./app/javascript/packs/application.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./app/javascript/packs/application.js":
/*!*********************************************!*\
  !*** ./app/javascript/packs/application.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

throw new Error("Module build failed (from ./node_modules/babel-loader/lib/index.js):\nSyntaxError: /mnt/c/Users/krpau/Desktop/RocketController/app/javascript/packs/application.js: Deleting local variable in strict mode (231:4)\n\n  229 | \n  230 |     // Not needed anymore\n> 231 |     delete initialMapData\n      |     ^\n  232 | }\n  233 | \n  234 | function updateTimeSinceLastUpdate()\n    at Parser.raise (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:6930:17)\n    at Parser.parseMaybeUnary (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:9134:16)\n    at Parser.parseExprOps (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:9011:23)\n    at Parser.parseMaybeConditional (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:8984:23)\n    at Parser.parseMaybeAssign (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:8930:21)\n    at Parser.parseExpression (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:8880:23)\n    at Parser.parseStatementContent (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:10740:23)\n    at Parser.parseStatement (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:10611:17)\n    at Parser.parseBlockOrModuleBlockBody (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:11187:25)\n    at Parser.parseBlockBody (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:11174:10)\n    at Parser.parseBlock (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:11158:10)\n    at Parser.parseFunctionBody (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:10177:24)\n    at Parser.parseFunctionBodyAndFinish (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:10147:10)\n    at withTopicForbiddingContext (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:11319:12)\n    at Parser.withTopicForbiddingContext (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:10486:14)\n    at Parser.parseFunction (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:11318:10)\n    at Parser.parseFunctionStatement (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:10959:17)\n    at Parser.parseStatementContent (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:10649:21)\n    at Parser.parseStatement (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:10611:17)\n    at Parser.parseBlockOrModuleBlockBody (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:11187:25)\n    at Parser.parseBlockBody (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:11174:10)\n    at Parser.parseTopLevel (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:10542:10)\n    at Parser.parse (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:12051:10)\n    at parse (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/parser/lib/index.js:12102:38)\n    at parser (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/core/lib/transformation/normalize-file.js:168:34)\n    at normalizeFile (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/core/lib/transformation/normalize-file.js:102:11)\n    at runSync (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/core/lib/transformation/index.js:44:43)\n    at runAsync (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/core/lib/transformation/index.js:35:14)\n    at process.nextTick (/mnt/c/Users/krpau/Desktop/RocketController/node_modules/@babel/core/lib/transform.js:34:34)\n    at _combinedTickCallback (internal/process/next_tick.js:131:7)");

/***/ })

/******/ });
//# sourceMappingURL=application-bcb8d81587bef65c3153.js.map