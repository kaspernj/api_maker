var bundle = require('browserify')();
var fs = require('fs');


bundle.add('./wake-event');
bundle.bundle({standalone: 'wakeEvent'}).pipe(fs.createWriteStream('wake-event.bundle.js'));
