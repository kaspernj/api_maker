# wake-event


Simple browserify module based on [this clever trick](http://blog.alexmaccaw.com/javascript-wake-event) by [Alex MacCaw](http://twitter.com/macccaw).

It simply exports a single function that you can pass a callback to. 

When your computer wakes from sleep your callback will be called.

If you're not using a module system or using AMD use the `wake-event.bundle.js` file instead.

```js
var wakeEvent = require('wake-event');

wakeEvent(function () {
    console.log('computer woke up!');
});
```

If you're not using a module system at all, use [Alex's jQuery plugin](https://gist.github.com/maccman/5944646) or just include the bundle file by itself.

```html
<script src="wake-event.bundle.js"></script>
<script>
    wakeEvent(function () {
        console.log('computer awake!');
    });
</script>
```


## Installing

```
npm install wake-event
```

## Credits

Props for the core idea to Alex. Written by [@HenrikJoreteg](http://twitter.com/henrikjoreteg).

## License

MIT
