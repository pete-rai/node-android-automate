/*
 * node-android-automate v1.0.0
 * https://github.com/pete-rai/node-android-automate
 *
 * Copyright 2021 Pete Rai
 * Released under the MIT license
 * https://github.com/pete-rai/node-android-automate/blob/main/LICENSE
 *
 * Released with the karmaware tag
 * https://pete-rai.github.io/karmaware
 *
 * Website  : http://www.rai.org.uk
 * GitHub   : https://github.com/pete-rai
 * LinkedIn : https://uk.linkedin.com/in/raipete
 * NPM      : https://www.npmjs.com/~peterai
 *
 */

'use strict';

// --- dependencies

const engine = require('./engine');
const Keys = require('./keys');
const Screen = require('./screen');

// --- device class - the main device object

module.exports = class Device {

    // --- constructor

    constructor(caps = '.', tracing = false) {
        this._caps = caps;
        engine.tracing(tracing);
    }

    // --- promise then handler

    then(callback) {
        engine.then(callback); // delegate to engine
    }

    // --- returns information about the battery

    _battery() {
        engine.trace('querying battery...');

        return engine.adb('dumpsys battery')
        .then(info => {
            let bits = info.match(/level: (\d+)/);
            let level = parseInt(bits[1] ?? '0');

            engine.trace(`queried at ${ level }%`);
            return level;
        })
        .catch(err => 0);
    }

    battery() {
        return engine.chain(async () => await this._battery());
    }

    // --- starts the default browser and loads the specified url

    _browse(url) {
        engine.trace(`browsing to '${ url }'...`);

        return engine.adb(`am start -a android.intent.action.VIEW -d ${ url }`)
        .catch(err => engine.error('failure browsing'))
        .finally(() => engine.trace('browsed'));
    }

    browse(url) {
        engine.chain(async () => await this._browse(url))
        return this;
    }

    // --- starts the stills or video camera

    _camera(video) {
        engine.trace('opening ' + (video ? 'video' : 'stills') + ' camera...');

        return engine.adb(`am start -a android.media.action.${ video ? 'VIDEO_CAPTURE' : 'STILL_IMAGE_CAMERA' }`)
        .catch(err => engine.error('failure opening camera'))
        .finally(() => engine.trace('opened camera'));
    }

    camera(video = false) {
        engine.chain(async () => await this._camera(video));
        return this;
    }

    // --- whether the phone is connected for automation

    _connected() {
        return this._version().then(ver => ver > 0);
    }

    connected() {
        return engine.chain(async () => await this._connected());
    }

    // --- sends the given text input

    _input(text) {
        engine.trace(`inputting '${ text }'...`);

        return engine.adb(`input text '${ text.replace(/ /g, '%s') }'`)
        .catch(err => engine.error('failure inputting'))
        .finally(() => engine.trace('inputted'));
    }

    input(text) {
        engine.chain(async () => await this._input(text));
        return this;
    }

    // --- presses the given key code

    _press(keycode) {
        let keyname = Object.keys(Keys).find(name => Keys[name] === keycode);
        engine.trace(`pressing '${ keyname }' (${ keycode })...`);

        return engine.adb(`input keyevent ${ keycode }`)
        .catch(err => engine.error('failure pressing'))
        .finally(() => engine.trace('pressed'));
    }

    press(keycode) {
        engine.chain(async () => await this._press(keycode));
        return this;
    }

    // --- creates a new screen object and switches operation chain context to it

    screen(name) {
        return new Screen(this._caps, name, this);
    }

    // --- scrolls the screen vertically up or down by the given percentage

    _scroll(percent, down, speed) {
        percent = Math.min(100, Math.max(0, percent));
        engine.trace(`scrolling ${ down ? 'down' : 'up' } by ${ percent }% for ${ speed }ms...`);

        return this._size()
        .then(size => {
            let len =  size.h / 100 * percent;
            let gap = (size.h - len) / 2;
            let lo = { x: size.w / 2, y: size.h - gap };
            let hi = { x: size.w / 2, y: gap };

            return (down ? this._swipe(lo, hi, speed) : this._swipe(hi, lo, speed))
            .catch(err => engine.error('failure scrolling'))
            .finally(() => engine.trace('scrolled'));
        });
    }

    scroll(percent = 50, down = true, speed = 300) {
        engine.chain(async () => await this._scroll(percent, down, speed));
        return this;
    }

    // --- runs any other adb shell command

    _shell(command) {
        engine.trace(`shelling '${ command }'...`);

        return engine.adb(command)
        .catch(err => engine.error('failure shelling'))
        .finally(() => engine.trace('shelled'));
    }

    shell(command) {
        return engine.chain(async () => await this._shell(command));
    }

    // --- returns the size of the screen

    _size() {
        engine.trace('sizing...');

        return engine.adb('wm size')
        .then(info => {
            let bits = info.match(/(\d+)x(\d+)/);
            let size = { w: parseInt(bits[1] ?? '0'), h: parseInt(bits[2] ?? '0') };

            engine.trace(`sized at { w: ${ size.w }, h: ${ size.h } }`);
            return size;
        })
        .catch(err => ({ w: 0, h: 0 }));
    }

    size() {
        return engine.chain(async () => await this._size());
    }

    // --- starts the named package - use: adb shell pm list packages

    _start(app) {
        engine.trace(`starting '${ app }'...`);

        return engine.adb(`monkey -p ${ app } -c android.intent.category.LAUNCHER 1`)
        .catch(err => engine.error('failure starting'))
        .finally(() => engine.trace('started'));
    }

    start(app) {
        engine.chain(async () => await this._start(app));
        return this;
    }

    // --- swipes the screen in a straight line anchored at the given points

    _swipe(from, to, speed) {
        engine.trace(`swiping from { x: ${ from.x }, y: ${ from.y } } to { x: ${ to.x }, y: ${ to.y } } for ${ speed }ms...`);

        return engine.adb(`input swipe ${ from.x } ${ from.y } ${ to.x } ${ to.y } ${ speed }`)
        .catch(err => engine.error('failure swiping'))
        .finally(() => engine.trace('swiped'));
    }

    swipe(from, to, speed = 300) {
        engine.chain(async () => await this._swipe(from, to, speed));
        return this;
    }

    // --- swipes the screen in a path connected by all the given points

    swipes(points, pause = 300, speed = 300) {
        engine.trace(`swiping path of ${ points.length } points, at ${ speed }ms, pausing for ${ pause }ms...`);

        for (let i = 1 ; i < points.length ; i++) {
            this.swipe(points[i - 1], points[i], speed);
            this.wait(pause);
        }

        return this;
    }

    // --- long or short taps the screen at a given point

    _tap(point, duration) {
        let type = duration > 0 ? 'long ' : '';
        let time = duration > 0 ? ` for ${ duration }ms` : '';
        let taps = duration > 0 ? `swipe ${ point.x } ${ point.y } ${ point.x } ${ point.y } ${ duration }` : `tap ${ point.x } ${ point.y }`;

        engine.trace(`${ type }tapping at { x: ${ point.x }, y: ${ point.y } }${ time }...`);

        return engine.adb(`input ${ taps }`)
        .catch(err => engine.error('failure tapping'))
        .finally(() => engine.trace(`${ type }tapped`));
    }

    tap(point, duration = 0) {
        engine.chain(async () => await this._tap(point, duration));
        return this;
    }

    // --- outputs a trace message

    trace(text) {
        engine.chain(async () => engine.trace(text));
        return this;
    }

    // --- sets the trace mode

    tracing(mode) {
        engine.chain(async () => engine.tracing(mode));
        return this;
    }

    // --- returns the andriod version

    _version() {
        engine.trace('querying version...');

        return engine.adb('getprop ro.build.version.release')
        .then(info => {
            let version = parseInt(info ?? '0');

            engine.trace(`queried as v${ version }`);
            return version;
        })
        .catch(err => 0);
    }

    version() {
        return engine.chain(async () => await this._version());
    }

    // --- waits for a given time

    _wait(millisecs) {
        engine.trace(`waiting for ${ millisecs }ms...`);

        return engine.wait(millisecs)
        .catch(err => engine.error('failure waiting'))
        .finally(() => engine.trace('waited'));
    }

    wait(millisecs) {
        engine.chain(async () => await this._wait(millisecs));
        return this;
    }
}
