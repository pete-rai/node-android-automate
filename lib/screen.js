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

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const sharp = require('sharp');
const engine = require('./engine');

// --- screen class - methods for grabbing, manipulating, examining and reading screens

module.exports = class Screen {

    // --- constructor

    constructor(path, name, device) {
        this._path = path.replace(/\/+$/, ''); // removes any trailing slashes
        this._name = name;
        this._file = this._fullpath(name);
        this._device = device;

        if (!fs.existsSync(this._file)) {
            fs.closeSync(fs.openSync(this._file, 'w')); // make sure the underlying screen capture file exists
        }

        sharp.cache(false); // turn off sharp caching
    }

    // --- full path to a screen capture file

    _fullpath(name) {
        return path.resolve(process.env.PWD, `${ this._path }/${ name }.png`);
    }

    // --- promise then handler for chaining

    then(callback) {
        engine.then(callback); // delegate to engine
    }

    // --- clones this screen object

    clone(name) {
        engine.chain(async () => {
            engine.trace(`cloning '${ this._name }' to '${ name }'...`);
            fs.copyFileSync(this._file, this._fullpath(name));
            engine.trace('cloned');
        });

        return new Screen(this._path, name, this._device);
    }

    // --- extracts colors at the given points

    _colors(points) {
        engine.trace(`getting colors from '${ this._name }' at ${ points.length } point${ points.length === 1 ? '' : 's' }...`);

        let shot = sharp(this._file);
        let meta = null;

        return shot.metadata()

        .then(results => {
            meta = results;
            return shot.raw().toBuffer();
        })

        .then(data => {
            let colors = [];
            let matched = points.length > 0;

            for (let i = 0; i < points.length; i++) {
                let point = points[i];
                let delta = meta.channels * (meta.width * point.y + point.x);
                let slice = data.slice(delta, delta + meta.channels);
                let found = { x: point.x, y: point.y, c: { r: slice[0], g: slice[1], b: slice[2] } };

                matched &= _.isEqual(point, found);
                colors.push(found);
            }

            return { colors: colors, matched: matched ? true : false };
        })

        .catch(err => engine.error('failure getting colors'))
        .finally(() => engine.trace('got colors'));
    }

    colors(points) {
        return engine.chain(async () => await this._colors(points));
    }

    // --- whether the screen capture file contains the given image within it

    _contains(other, max) {
        engine.trace(`checking if '${ this._name }' contains at most ${ max } instance${ max === 1 ? '' : 's'} of '${ other }'...`);

        let file_o = sharp(this._file); // _o = outer
        let file_i = sharp(this._fullpath(other)); // _i = inner
        let buff_o = null;
        let buff_i = null;
        let meta_o = null;
        let meta_i = null;
        let awaits = [];

        awaits.push(file_o.raw().toBuffer().then(buffer => buff_o = buffer));
        awaits.push(file_i.raw().toBuffer().then(buffer => buff_i = buffer));
        awaits.push(file_o.metadata().then(metadata => meta_o = metadata));
        awaits.push(file_i.metadata().then(metadata => meta_i = metadata));

        return Promise.all(awaits)

        .then(() => {
            let size_o = meta_o.width * meta_o.channels;
            let size_i = meta_i.width * meta_i.channels;

            let upper = buff_i.slice(0, size_i); // upper row of inner
            let found = -1;
            let finds = [];

            if (meta_i.width <= meta_o.width && meta_i.height <= meta_o.height) { // must be containable within

                do {

                    found = buff_o.indexOf(upper, found + 1); // upper row is present, so its another candidate

                    if (found != -1) {
                        let matches = true;

                        let oy = Math.floor(found / size_o);
                        let ox = Math.floor((found - size_o * oy) / meta_o.channels);

                        for (let y = 1; matches && y < meta_i.height; y++) { // start from one as upper row is already matched
                            let pos_i = y * size_i;
                            let pos_o = y * size_o + found;

                            let slice_i = buff_i.slice(pos_i, pos_i + size_i);
                            let slice_o = buff_o.slice(pos_o, pos_o + size_i);

                            matches &= slice_o.equals(slice_i); // does next row also match?
                        }

                        if (matches) {
                            finds.push({ x: ox, y: oy, w: meta_i.width, h: meta_i.height });

                            /*    await sharp(outer)  // debug test only code!
                                  .extract({ left: finds[finds.length - 1].x,
                                              top: finds[finds.length - 1].y,
                                            width: finds[finds.length - 1].w,
                                           height: finds[finds.length - 1].h })
                                  .toBuffer()
                                  .then(buffer => sharp(buffer).toFile(`found_${ finds.length }.png`)); */
                        }
                    }

                }
                while (found != -1 && finds.length < max);
            }

            return finds;
        })

        .catch(err => engine.error('failure checking contained'))
        .finally(() => engine.trace('checked contained'));
    }

    contains(other, max = 1) {
        return engine.chain(async () => await this._contains(other, max));
    }

    // --- crops to the given section

    _crop(section) {
        engine.trace(`cropping '${ this._name }' at { x: ${ section.x }, y: ${ section.y }, w: ${ section.w }, h: ${ section.h } }...`);

        return sharp(this._file)
        .extract({ left: section.x, top: section.y, width: section.w, height: section.h })
        .toBuffer()
        .then(buffer => sharp(buffer).toFile(this._file)) // only way to save back to same filename in sharp
        .catch(err => engine.error('failure cropping'))
        .finally(() => engine.trace('cropped'));
    }

    crop(section) {
        engine.chain(async () => this._crop(section));
        return this;
    }

    // --- deletes the underlying screenshot file

    delete() {
        engine.chain(async () => {
            engine.trace(`deleting '${ this._name }'...`);
            fs.unlinkSync(this._file);
            engine.trace('deleted');
        });

        return this.device();
    }

    // --- switches the operation chain context back to the device

    device() {
        return this._device;
    }

    // --- returns the name of the underlying image file

    file() {
        return engine.chain(() => this._file);
    }

    // --- converts to greyscale

    _greyscale() {
        engine.trace(`greyscaling '${ this._name }'...`);

        return sharp(this._file)
        .greyscale()
        .toBuffer()
        .then(buffer => sharp(buffer).toFile(this._file)) // only way to save back to same filename in sharp
        .catch(err => engine.error('failure greyscaling'))
        .finally(() => engine.trace('greyscaled'));
    }

    greyscale() {
        engine.chain(async () => await this._greyscale());
        return this;
    }

    // --- reads text within the screen section

    _read(clean) {
        engine.trace(`${ clean ? 'clean ' : ''}reading '${ this._name }'...`);

        return engine.ocr(this._file)
        .then(text => clean ? text.replace(/\s+/g, ' ').trim() : text) // normalise whitespace
        .catch(err => engine.error('failure reading'))
        .finally(() => engine.trace('read'));
    }

    read(clean = true) {
        return engine.chain(async () => await this._read(clean));
    }

    // --- saves the screenshot to the given file

    save(file) {
        engine.chain(async () => {
            engine.trace(`saving '${ this._name }' to '${ file }'...`);
            fs.copyFileSync(this._file, file);
            engine.trace('saved');
        });

        return this;
    }

    // --- switches context to a new or existing other screen instance

    screen(name) {
        return new Screen(this._path, name, this._device)
    }

    // --- returns the underlying sharp class instance

    sharp() {
        return engine.chain(() => sharp(this._file));
    }

    // --- sharpens an image

    _sharpen() {
        engine.trace(`sharpening '${ this._name }'...`);

        return sharp(this._file)
        .sharpen()
        .toBuffer()
        .then(buffer => sharp(buffer).toFile(this._file)) // only way to save back to same filename in sharp
        .catch(err => engine.error('failure sharpening'))
        .finally(() => engine.trace('sharpened'));
    }

    sharpen() {
        engine.chain(async () => await this._sharpen());
        return this;
    }

    // --- takes a screenshot

    _shoot() {
        engine.trace(`shooting '${ this._name }'...`);

        return engine.adb(`screencap -p > ${ this._file }`)
        .catch(err => engine.error('failure shooting'))
        .finally(() => engine.trace('shot'));
    }

    shoot() {
        engine.chain(async () => await this._shoot());
        return this;
    }

    // --- sharpens an image

    _threshold(value) {
        value = Math.min(255, Math.max(0, value));
        engine.trace(`thresholding '${ this._name }' with value ${ value }...`);

        return sharp(this._file)
        .threshold(value)
        .toBuffer()
        .then(buffer => sharp(buffer).toFile(this._file)) // only way to save back to same filename in sharp
        .catch(err => engine.error('failure thresholding'))
        .finally(() => engine.trace('thresholded'));
    }

    threshold(value = 128) {
        engine.chain(async () => await this._threshold(value));
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
