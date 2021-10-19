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

// --- dependencies - see also readme notes about 'adb' and 'tesseract'

const Keys = require('./lib/keys.js');
const Screen = require('./lib/screen.js');
const Device = require('./lib/device.js');

// --- declare the exports

module.exports = { Keys, Screen, Device }
