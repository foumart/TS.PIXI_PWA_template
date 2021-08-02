"use strict";

var _name = "";
var _online = location.protocol.substring(0, 5) == "https";

var _debug;
var _debug_canvas, _debug_context, _main_debug, _loading, _loadingbar;
var _width, _height;

// Logging function
// ----------------
var _start = (performance || Date).now();
var _loadingTime = 0;
var _logString;
function _log() {
	if (!_debug) return;

	_logString = "" + (_getElapsedLogTime() - _loadingTime);
	if (_logString.length < 6) _logString += (".0000").substr(_logString.length - 1);
	else if (_logString.length > 6) _logString = _logString.substring(0, 6);

	_logString += " " + _name + " ";
	for (var i = 0; i < arguments.length; i++) {
		_logString += arguments[i] + ((i < arguments.length - 1) ? ", " : "");
	}

	console.log(_logString);
}
function _getElapsedLogTime() {
	return (parseInt((performance || Date).now() - _start) / 1000);
}

// ServiceWorker registration
// --------------------------
if ("serviceWorker" in navigator && _online) {
	navigator.serviceWorker.addEventListener("message", function (event) {
		_log(event.data.msg);
	});

	navigator.serviceWorker.getRegistrations().then(function (registrations) {
		var _isRegistered;
		for (var i = 0; i < registrations.length; i++) {
			if (window.location.href.indexOf(registrations[i].scope) > -1) {
				_isRegistered = true;
			}
		}
		if (_isRegistered) {
			_log("ServiceWorker already registered");
		} else {
			navigator.serviceWorker.register("./serviceworker.js").then(function () {
				_log("ServiceWorker registered successfully");
			}).catch(function () {
				_log("ServiceWorker registration failed");
				_init();
			});
		}
	}).catch(function () {
		_log("ServiceWorker bypassed locally");
		_init();
	});

	navigator.serviceWorker.ready.then(function (registration) {
		_log('ServiceWorker is now active');
		// example of sending data to the service worker:
		// registration.active.postMessage("test");
		_init();
	});
} else {
	if (!_online) {
		_log("ServiceWorker is disabled in development builds");
	} else {
		_log("ServiceWorker not found in navigator");
	}

	window.addEventListener("load", _init);
}
function _sendMessage(message) {
	navigator.serviceWorker.controller.postMessage(message);
}

// Initialization
// --------------
function _init() {
	_loadingTime = _getElapsedLogTime();
	_loading = document.getElementById("_loading");
	_loadingbar = document.getElementById("_loadingbar");
	if (_debug) {
		_main_debug = document.getElementById("_main_debug");
		_debug_canvas = document.createElement("canvas");
		_debug_canvas.width = 120;
		_debug_canvas.height = 20;
		_debug_canvas.style.right = 0;
		_debug_canvas.style.zIndex = 1;
		_debug_canvas.style.cursor = "pointer";
		_main_debug.appendChild(_debug_canvas);
		_debug_context = _debug_canvas.getContext('2d');
		_main_debug.style.display = "block";
		_debug_display("Debugging Application");
		_debug_canvas.addEventListener("click", function () {
			if (_fps) {
				_fps = 0;
				_debug_display(_mes);
			} else {
				_fps = 1;
				_drawFPS();
			}
		})

	}

	window.focus();
	window.addEventListener("resize", _resize, false);
	_standalone = window.matchMedia("(display-mode: standalone)").matches;
	if (_standalone) _log("Game is running as Standalone PWA");
	if (_standalone && !_fullscreenElement) {
		_log("Requesting Fullscreen...");
		_toggleFullscreen();
	}
}

// FPS display
// -----------
var _times = [];
var _fps, _now, _mes;
function _drawFPS() {
	if (!_debug || !_fps) return;
	_now = (performance || Date).now();
	while (_times.length > 0 && _times[0] <= _now - 1000) {
		_times.shift();
	}
	_times.push(_now);
	_fps = _times.length;
	_debug_display("FPS: " + _fps, true);
	console.log(_times);
	requestAnimationFrame(_drawFPS);
}
function _debug_display(message, fps) {
	if (!fps) _mes = message;
	_debug_context.clearRect(0, 0, _debug_canvas.width, _debug_canvas.height);
	_debug_context.fillStyle = "#ccc";
	_debug_context.fillText(message, 4, 12);
}

// Resize
// ------
function _resize(e) {
	_width = document.documentElement.clientWidth;
	_height = document.documentElement.clientHeight;
}

// Fullscreen API
// --------------
var _fullscreenElement, _standalone;
document.addEventListener("fullscreenchange", _fullscreenCheck);
function _toggleFullscreen(e) {
	try {
		var _documentElement = document.documentElement || document.msFullscreenElement;
		var _fullscreenPromise;
		if (!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement)) {
			_fullscreenPromise = (
				_documentElement.requestFullscreen ||
				_documentElement.mozRequestFullScreen ||
				_documentElement.webkitRequestFullScreen ||
				_documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT) ||
				_documentElement.msRequestFullscreen
			).call(_documentElement).catch(_fullscreenError.bind(this));
		}
		else if (document.exitFullscreen) document.exitFullscreen();
		else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
		else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
		else if (document.msExitFullscreen) document.msExitFullscreen();
	} catch (err) {
		_fullscreenError(err);
	}
}
function _fullscreenCheck(e) {
	_fullscreenElement = document.fullscreenElement;
}
function _fullscreenError(err) {
	_log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
}

// App event handlers
// ------------------
window.document.addEventListener("loading", _loadEvent, false);
function _loadEvent(event) {
	_loadingbar.style.width = event.detail + "%";
	if (event.detail === 100) {
		_loading.style.transitionDelay = "1s";
		_loading.style.opacity = 0;
	}
}

window.document.addEventListener("debug", _debugEvent, false);
function _debugEvent(event) {
	_debug_display(event.detail);
}

window.document.addEventListener("fullscreen", _fullscreenEvent, false);
function _fullscreenEvent(event) {
	_toggleFullscreen();
}

window.document.addEventListener("log", _logEvent, false);
function _logEvent(event) {
	_log(event.detail);
}
