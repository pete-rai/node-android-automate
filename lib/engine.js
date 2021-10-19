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

const moment = require('moment');
const exec = require('child_process').exec;
const path = require('path');

// --- constants

const TESSERACT_OPTIONS = process.env.TESSERACT_OPTIONS || '-l eng --oem 1 --psm 11'; // experimental best ocr options
const TESSERACT_PATH = process.env.TESSERACT_PATH || null;
const TESSERACT_EXEC = TESSERACT_PATH ? path.resolve(TESSERACT_PATH, 'tesseract') : 'tesseract';
const ADB_PATH = process.env.ADB_PATH || null;
const ADB_EXEC = ADB_PATH ? path.resolve(ADB_PATH, 'adb') : 'adb'

// --- engine class - methods for sequencing operations and calling external modules

class Engine {

    // --- constructor

    constructor() {
        this._chain = Promise.resolve(); // roots the chain with a promise
        this._trace = false;
    }

    // --- executes an andriod debugger shell command

    adb(command) {
        return this.exec(`${ ADB_EXEC } shell ${ command }`);
    }

    // --- adds a method to the operation chain

    chain(callback) {
        return this._chain = this._chain.then(callback);
    }

    // --- executes an external os shell command as a promise

    exec(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                error ? reject(error) : resolve(stdout);
            });
        });
    }

    // --- executes a call to tesseract

    ocr(file) {
        return this.exec(`${ TESSERACT_EXEC } ${ file } stdout ${ TESSERACT_OPTIONS }`);
    }

    // --- promise then handler for chaining

    then(callback) {
        callback(this._chain);
    }

    // --- outputs a trace message

    trace(text) {
        if (this._trace) console.log(`${ moment().format('YYYY-MM-DD HH:mm:ss') }: ${ text }`);
    }

    // --- outputs an error message

    error(text) {
        this.trace(`error - ${ text }`);
    }

    // --- sets the trace mode

    tracing(mode) {
        this._trace = mode;
    }

    // --- waits for the given time

    wait(millisecs) {
        return new Promise(resolve => { setTimeout(() => resolve(), millisecs) });
    }
}

// ---  declares the master global engine instance used for sequencing all operations

module.exports = new Engine();
