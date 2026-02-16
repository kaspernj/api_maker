var timeout = 5000;
var lastTime = Date.now();
var callbacks = [];

setInterval(function() {
    var currentTime = Date.now();
    if (currentTime > (lastTime + timeout + 2000)) {
        callbacks.forEach(function (fn) {
            fn();
        });
    }
    lastTime = currentTime;
}, timeout);

module.exports = function (fn) {
    callbacks.push(fn);
};
