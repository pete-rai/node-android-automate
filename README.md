# node-android-automate

> Visit my [Blog](http://pete.rai.org.uk/) to get in touch or to see demos of this and much more.

## Contents

  * [Overview](#overview)
    + [Demonstration](#demonstration)
    + [License](#license)
    + [Karmaware](#karmaware)
    + [Disclaimer](#disclaimer)
  * [Before You Start](#before-you-start)
    + [Dependencies](#dependencies)
    + [Connecting Devices](#connecting-devices)
    + [Configuration](#configuration)
  * [Using the Module](#using-the-module)
    + [System Objects](#system-objects)
    + [Complete Function List](#complete-function-list)
      - [Device](#device)
      - [Screen](#screen)
    + [Example Usage](#example-usage)

## Overview

This node module allows you to automate tasks on your Android device using simple, flexible [function chains](https://en.wikipedia.org/wiki/Method_chaining).

> If you use this module, please do [get in touch](http://pete.rai.org.uk/) and let me know what you built and how you got on.

Here is an example of a function chain which opens the default browser, visits a website, scroll down a bit, takes a screen shot, crops and greyscales it and then reads any text therein.

```javascript
device.browse('https://en.wikipedia.org')
      .wait(2500)
      .scroll(50)
      .wait(1000)
      .screen('example')
      .shoot()
      .crop({ x: 50, y: 500, w: 1300, h: 150 })
      .greyscale()
      .read();
```

This module offers an extensive range of such functions allowing for the manipulation and control of any connected Android device. All the available methods are fully documented here.

It should be noted that many of the available methods are asynchronous in nature, in that their execution is normally independent of the main program flow. Obviously this is at odds with the process of placing them into a function chain. The core engine within ```android-automate``` handles this conflict by strictly sequencing all operations in the order in which they were specified. This is true even when those operations appear on separate lines within the housing script.

### Demonstration

You will find lots of small examples of using ```android-automate``` within in this document. In addition to these, you can also examine one large demonstration application - a program which automatically plays the popular mobile puzzle game [FlowFree](https://www.bigduckgames.com/flowfree).

> https://github.com/pete-rai/flowfree-player

### License

This project is available under [the MIT license](https://github.com/pete-rai/node-android-automate/blob/main/LICENSE). _Please respect the terms of the license._

### Karmaware

This software is released with the [karmaware](https://pete-rai.github.io/karmaware) tag

### Disclaimer

I've done best efforts testing on a range of devices. If you find any problems, please do let me know by raising an issue [here](https://github.com/pete-rai/node-android-automate/issues). Better still, create a fix for the problem too and drop in the changes; that way everyone can benefit from it.

## Before You Start

Before you get going with your own scripts, there are some steps you must complete to ensure that your device is correctly installed, configured and connected.

### Dependencies

This module has a dependency on presence of [Android Platform Tools](https://developer.android.com/studio/releases/platform-tools). There are extensive notes on how to install these tools on a range of host machines at the Android Developer website:

> https://developer.android.com/studio/releases/platform-tools

Specifically, the module assumes the presence of the Android Debug Bridge ```adb```. This tool should either be on the execution path of the hosting machine, or the path to it should be specified to ```android-automate``` (see the configuration section below).

IF you want to use ```android-automate``` to read text from the screen of your Android device using the ```Screen.read``` method, THEN this module also has a dependency on presence of the [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) engine. There are extensive notes on how to install this engine on a range of host machines at the Tesseract User Manual website:

> https://tesseract-ocr.github.io/tessdoc/Home.html

The Tesseract OCR command line tool should either be on the execution path of the hosting machine, or the path to it should be specified to ```android-automate``` (see the configuration section below).

Note: That both ```adb``` and ```tesseract``` are _external dependencies_. That is, that they are outside of the node package management area. These applications are invoked directly, rather than via the ```node_modules``` mechanism. Please do test that these applications are installed and operational before using ```android-automate```.

### Connecting Devices

Any Android compatible device can be connected to ```android-automate``` to allow access and control. This can be achieved in either a wired or wireless mode. The steps to accomplish a connection are outlined over dozens of articles across the web. Perhaps the clearest is from the Android team itself:

> https://developer.android.com/studio/command-line/adb

It is important that you test the connection to your device _before_ you start using ```android-automate```. This can be done by executing the command ```adb devices``` as detailed in the linked article above. Only move on to using ```android-automate``` after this step is complete and the output of ```adb devices``` includes your target Android device.

### Configuration

There is _no reason to configure anything_ to use ```android-automate```; you can use if out-of-the-box and it will deliver good service. However, there are a few parameters which you can tweak to slightly modify its behaviour. If you want to set any of this configuration you should utilise the services of the [dotenv](https://www.npmjs.com/package/dotenv) node package. This will read your preferred values from an ```.env``` file and load them into an environment space from where ```android-automate``` will have access to them. Note: Make sure that you load ```dotenv``` in your code _before_ you require ```android-automate```.

| Option | Default | Description |
| --- | --- | --- |
| <tt>ADB_PATH</tt> |  | The path to your adb executable. If not present, then adb should be on your execution path. |
| <tt>TESSERACT_PATH</tt> |  | The path to your tesseract executable. If not present, then tesseract should be on your execution path. |
| <tt>TESSERACT_OPTIONS</tt> | <tt>-l&nbsp;eng&nbsp;--oem&nbsp;1&nbsp;--psm&nbsp;11</tt> | The tesseract options used to read on-screen text. See the Tesseract documentation for more detail. Note the default options are optimised to read English language text. |

If you decide to modify any of these parameters, be sure to use the _exact same name_ as specified in the table above.

## Using the Module

In this section, we outline all the objects and functions which you can use as part of ```android-automate```. We also demonstrate these via a series of small examples, to help you get started with your own scripts. This section assumes that you have read and completed the previously outlined steps of installing and testing the dependencies, setting your preferred configuration and connecting your target device.

### System Objects

There are two system objects which can be used part of ```android-automate``` function chains: ```device``` and ```screen```. The device object is the main player and has chainable functions to control the device itself: tap, press, browse, scroll, etc. The screen object represents a given screenshot taken from the device and has chainable functions to manipulate this image: shoot, crop, greyscale, colors, read, etc.

You can create a device instance and then you can chain functions on from there:

```javascript
let device = new AndroidAutomate.Device();
device.browse(url).wait(2500).scroll(50).wait(1000);
```

You create screen instances by chaining-on a screen function onto an existing device object:

```javascript
device.browse(url).wait(2500).scroll(50).wait(1000).screen('screen_0');
```

The most common first thing to do to a new screen instance is to take a screenshot of the current screen on the connected device:

```javascript
device.browse(url).wait(2500).scroll(50).wait(1000).screen('screen_0').shoot();
```

It should be noted that, once you create a screen object, the context of the chain transfers to screen methods. This means you can only chain-on screen methods from that point on:

```javascript
// the next line won't work, because scroll is a device method
device.browse(url).wait(2500).scroll(50).wait(1000).screen('screen_0').shoot().scroll();

// but this line will work, since greyscale is a screen method
device.browse(url).wait(2500).scroll(50).wait(1000).screen('screen_0').shoot().greyscale();
```

However you can, at any point, switch a function chain back to the device context and then chain-on device methods again:

```javascript
// now this will work, as the device context has been switched back in
device.browse(url).wait(2500).scroll(50).wait(1000).screen('screen_0').shoot().device().scroll();
```

When you create a screen object and take a screenshot from the device into it, a PNG image file is created on the hosting machine. This will be located in the directory which you passed-in as the first parameter to the newly create device object (or the current directory if you did not specify an alternative location). For example, in the code above, a local file will be created in the current directory called ```screen_0.png```. Subsequent screen operations will then be performed in context of this file.

If you later in a chain want to return to a previously created image, you can simply refer to it by its name. Then subsequent operations will be performed on this earlier image.

```javascript
// this will take two screenshots and greyscale the first of these
device.screen('screen_0').shoot().screen('screen_1').shoot().screen('screen_0').greyscale();
```

Some methods on both the ```device``` and ```screen``` objects return _values_. For example, ```Device.size``` returns an object which describes the size of the device's screen; ```Screen.read``` return text read from the specified area of the screen image. Functions such as these, which return values, cannot be used to chain-on further operations. They represent the end of their hosting chain.

```javascript
// this next line ends in a value function, which terminates the chain of operations
let size = await device.browse(url).wait(2500).size();

// but you can always just carry on with a new chain on later lines
device.scroll(50).wait(1000);
```

Once you get going with devices and screens, you will quickly see the value that function chaining brings. You should also examine the small examples shown later in this document to learn more about how to exploit the features of ```android-automate```.

### Complete Function List

Here is a complete list of all the functions which are available within ```android-automate```. You will find an example of each of these in the later section of this document. Use these examples to understand on object formats for the function inputs and outputs.

#### Device

These are all the functions of the ```Device``` class. Please note the default values of some parameters, if you omit them.
##### Constructor

This is how you create a new device instance:

| Function | Description |
| --- | --- |
| <tt>new&nbsp;Device(temp='.',&nbsp;tracing=false)</tt> | Creates a new device instance. You can _optionally_ specify a location for temporary files (including screen images) and whether or not tracing is switched on from the start. |

##### Chainable

These are the chainable functions:

| Function | Description |
| --- | --- |
| <tt>browse(url)</tt> | Starts the default browser and navigates to the given URL. |
| <tt>camera(video=false)</tt> | Opens the device camera - by default in stills mode, but use the parameter to open it in video mode. |
| <tt>input(text)</tt> | Inputs the given text into whatever field has the current input focus. |
| <tt>press(keycode)</tt> | Presses a key using an Android keycode. See below for more details of these. |
| <tt>scroll(percent=50,&nbsp;down=true,&nbsp;speed=300)</tt> | Scrolls the screen using a swipe - by default it swipes 50% of the screen, in 300 milliseconds in a upward direction, leading to a downward scroll. Note: It is a good idea to chain a wait after a scroll, in order to allow for the visual scroll to complete on the device. |
| <tt>start(app)</tt> | Starts the given application, using its internal Android application name. |
| <tt>swipe(from,&nbsp;to,&nbsp;speed=300)</tt> | Swipes the screen from the given point, to the given point, at the given speed in milliseconds. |
| <tt>swipes(points,&nbsp;pause=300,&nbsp;speed=300)</tt> | swipes the screen in a path connected by all the given points, at given speed in milliseconds, with the given pauses in milliseconds. |
| <tt>tap(point,&nbsp;duration=0)</tt> | Taps the screen at the given point, for the given duration. |
| <tt>trace(text)</tt> | Outputs the given text into the trace stream.  |
| <tt>tracing(mode)</tt> | Switches tracing on or off. |
| <tt>wait(millisecs)</tt> | Pauses the the functions chain for the given number of milliseconds. |

The ```press``` function takes an Android keycode as its parameter. There is a complete list of such keycodes included within the ```Keys``` enumeration, for example ```Keys.CAMERA``` or ```Keys.HOME```. You can find a complete set of Android keycodes using the link below:

> https://github.com/pete-rai/node-android-automate/blob/main/lib/keys.js

Note that the function ```swipes``` is a simple wrapper over calling ```swipe``` multiple times. You need to send at least two points to this method for it to do anything useful.

##### Information

These are the information delivering functions, which hence are not chainable:

| Function | Description |
| --- | --- |
| <tt>battery()</tt> | Returns the current battery level as an integer percentage.  |
| <tt>connected()</tt> | Returns a boolean to indicate if the device is connected. |
| <tt>shell(command)</tt> | Executes an ```adb``` shell command and returns the output. See below for more details of these. |
| <tt>size()</tt> | Returns an object describing the size of the device screen. |
| <tt>version()</tt> | Returns the current major Android version of the device as an integer.  |

This module uses ```adb shell``` commands to achieve the functionality which it makes available. However, if there is something else that you want to do which is not represented here, you can call the ```adb shell``` infrastructure directly using the ```shell``` function. You can find more information about these shell comments using the link below:

> See https://developer.android.com/studio/command-line/adb#shellcommands

If you do use this, perhaps also [raise an issue](https://github.com/pete-rai/node-android-automate/issues) on ```android-automate``` if you believe that this is because there is something missing in our function set.

##### Context

These are the functions, which change the context of the chain over to the ```Screen``` class:

| Function | Description |
| --- | --- |
| <tt>screen(name)</tt> | Switches to a screen context with the given name. |

#### Screen

These are all the functions of the ```Screen``` class. Please note the default values of some parameters, if you omit them:

##### Constructor

You cannot create a new screen instance directly; this can only be done using the ```Device.screen``` function, documented above.

##### Chainable

These are the chainable functions:

| Function | Description |
| --- | --- |
| <tt>crop(section)</tt> | Crops the screen image using the given rectangle. |
| <tt>greyscale()</tt> | Greyscales the screen image. Often useful ahead of OCR text reading. |
| <tt>save(file)</tt> | Saves the screen image to the given file. Note you can use a variety of image formats here. |
| <tt>sharpen()</tt> | Sharpens the screen image. Often useful ahead of OCR text reading. |
| <tt>shoot()</tt> | Takes a screenshot of the current device screen. |
| <tt>threshold(value=128)</tt> | Makes a stark, two color image based on the threshold value between 0 and 255. Often useful ahead of OCR text reading. |
| <tt>trace(text)</tt> | Outputs the given text into the trace stream.  |
| <tt>tracing(mode)</tt> | Switches tracing on or off. |
| <tt>wait(millisecs)</tt> | Pauses the the functions chain for the given number of milliseconds. |

##### Information

These are the information delivering functions, which hence are not chainable:

| Function | Description |
| --- | --- |
| <tt>colors(points)</tt> | Returns the RGB color values at each of the specified points inside the current screen image. If you send in RBG values it also checks that your expectations match what is on the screen. See the notes below on this. |
| <tt>contains(other,&nbsp;max=1)</tt> | Returns the number of times the given other screen appears anywhere within the current screen image - optionally once or many times. See the notes below on this. |
| <tt>file()</tt> | Returns the name of the underlying image filename. |
| <tt>read(clean=true)</tt> | Returns OCR'd text from within the given screen, optionally cleaning its white space. |
| <tt>sharp()</tt> | Returns the name of the underlying sharp class instance. See below for explanation. |

You can see that ```andriod-automate``` offers a range of functions to manipulate the screen image. These are most often useful to prepare a screenshot so that it can be better read by the OCR engine. Reading text from within an image can be tricky and error prone. It is often useful to manipulate the image to make it as easy as possible for the OCR engine to read the text. Techniques that are often applied here include:

* crop - to isolate the area of the screen where the text to be read can be found.
* greyscale - to remove colors and make it easier to discern text from other elements.
* sharpen - to improve the edges of the text, so it can be more easily identified.
* threshold - to make a stark separation between text and background.

The two methods ```colors``` and ```contains``` are very good for identifying screens and for finding the location of on-screen elements, such as buttons or sprites. These are very powerful functions and you are encouraged to explore the example use of them in the later section of this document.

Whilst ```andriod-automate``` offers some image preparing methods, you may well find that you want to do something else to manipulate the screen image. This is facilitated by two methods on the screen class: ```sharp``` and ```file```. Internally ```andriod-automate``` uses the node [Sharp](https://sharp.pixelplumbing.com/) module to perform image actions. You can ask for the raw sharp image, so that you can then perform your own operations using it.

```javascript
// get the raw sharp object
let sharp = await device.screen('example_0').shoot().sharp();

// perform some sharp operations directly
await sharp.greyscale().modulate({ brightness: 2 }).toFile('example_1.png');

// load this new image within a screen class instance
let text = await device.screen('example_1').read();
```

If you don't want to use the sharp library, you can use the ```Screen.file``` method to get the name of the raw image file, which can then process in your image library of choice.

##### Context

These are the functions, which change the context of the chain to either a new ```Screen``` or back to the ```Device``` class:

| Function | Description |
| --- | --- |
| <tt>clone(name)</tt> | Makes a clone of the current screen and switches to its context. |
| <tt>delete()</tt> | Deletes the current screen and switches the context back to the device context. |
| <tt>device()</tt> | Switches the context back to the device. |
| <tt>screen(name)</tt> | Switches the context to a new or existing other screen instance. |

Be sure to ```await``` the result of the ```Screen.delete``` function. This will be chained into the sequence, but the switch of context will happen too early with you call it without awaiting (or outside of a promise chain).

### Example Usage

One great way to learn how to use ```android-automate``` is though a series of simple examples. Here we will show all the functions in actions in small bite-size code chunks - which you can use as templates for your own scripts.

All the examples below assume that you have declared the module ```android-automate``` in file scope, that you have installed it using the node package manager and that you have followed the [Before You Start](#before-you-start) steps outlined above.

```javascript
const AndroidAutomate = require('android-automate');
```

This basic example, simply tests whether the device is correctly connected, such that it is reachable by the ```android-automate``` module.

```javascript
async function example_0 (tracing = false) {
    let device = new AndroidAutomate.Device().tracing(tracing);
    let connected = await device.connected();

    console.log(`The device is ${ connected ? '' : 'not ' }connected`);
}
```

Here is the output for this function when the device is connected and tracing is switched off:

```
The device is connected
```

And the same when tracing is switched on:

```
2021-10-02 08:28:47: querying version...
2021-10-02 08:28:47: queried as v10

The device is connected
```

In all further examples, we will show the output with tracing switched __on__. Here is what you will see if the device is not correctly connected:

```
2021-10-02 08:37:19: querying version...

The device is not connected
```

Whenever the device is not connected, the module functions will return empty results - the screen size will be 0x0, the battery level will be 0, the version will be 0, chainable methods will do nothing, etc. The module will not generate exceptions, but it will log these issues if you have tracing switched on. We will _not_ show any further device not connected scenarios in these examples.

The example function shown above is using the [async / await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await) syntax. This representation arguably leads to the clearest code. However, if you prefer, you can easily convert any of the examples over to [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) syntax:

```javascript
function example_00 (tracing = false) {
    let device = new AndroidAutomate.Device().tracing(tracing);
    device.connected()
          .then(connected => console.log(`The device is ${ connected ? '' : 'not ' }connected`));
}
```

In all further examples we show here, we will be using async / await syntax.

```javascript
async function example_1 (tracing = false) {
    let device = new AndroidAutomate.Device().tracing(tracing);
    let size = await device.size();
    let batt = await device.battery();
    let vern = await device.version();

    console.log(`Screen: ${ size.w } x ${ size.h }, Battery: ${ batt }%, Running: Android v${ vern }`);
}
```

This example, gets lots of information from the device. Here is what the output looks like:

```
2021-10-02 09:42:58: sizing...
2021-10-02 09:42:59: sized at { w: 1440, h: 2960 }
2021-10-02 09:42:59: querying battery...
2021-10-02 09:42:59: queried at 87%
2021-10-02 09:42:59: querying version...
2021-10-02 09:42:59: queried as v10

Screen: 1440 x 2960, Battery: 87%, Running: Android v10
```

Here is a more complex example:

```javascript
async function example_2 (tracing = false) {
    let device = new AndroidAutomate.Device().tracing(tracing);
    let url = 'https://en.wikipedia.org/wiki/Star_Trek:_The_Original_Series';

    await device.browse(url).wait(2500);
    await device.scroll().wait(1000).scroll().wait(1000).scroll(25).wait(1000).scroll(75, false);
}
```

It opens a page in the default browser, waits for it to loads and the scrolls back and forth a few times. Here is the output of this function:

```
2021-10-02 10:02:18: browsing to 'https://en.wikipedia.org/wiki/Star_Trek:_The_Original_Series'...
2021-10-02 10:02:19: browsed
2021-10-02 10:02:19: waiting for 2500ms...
2021-10-02 10:02:21: waited
2021-10-02 10:02:21: scrolling down by 50% for 300ms...
2021-10-02 10:02:21: sizing...
2021-10-02 10:02:21: sized at { w: 1440, h: 2960 }
2021-10-02 10:02:21: swiping from { x: 720, y: 2220 } to { x: 720, y: 740 } for 300ms...
2021-10-02 10:02:22: swiped
2021-10-02 10:02:22: scrolled
2021-10-02 10:02:22: waiting for 1000ms...
2021-10-02 10:02:23: waited
2021-10-02 10:02:23: scrolling down by 50% for 300ms...
2021-10-02 10:02:23: sizing...
2021-10-02 10:02:23: sized at { w: 1440, h: 2960 }
2021-10-02 10:02:23: swiping from { x: 720, y: 2220 } to { x: 720, y: 740 } for 300ms...
2021-10-02 10:02:24: swiped
2021-10-02 10:02:24: scrolled
2021-10-02 10:02:24: waiting for 1000ms...
2021-10-02 10:02:25: waited
2021-10-02 10:02:25: scrolling down by 25% for 300ms...
2021-10-02 10:02:25: sizing...
2021-10-02 10:02:25: sized at { w: 1440, h: 2960 }
2021-10-02 10:02:25: swiping from { x: 720, y: 1850 } to { x: 720, y: 1110 } for 300ms...
2021-10-02 10:02:25: swiped
2021-10-02 10:02:25: scrolled
2021-10-02 10:02:25: waiting for 1000ms...
2021-10-02 10:02:26: waited
2021-10-02 10:02:26: scrolling up by 75% for 300ms...
2021-10-02 10:02:26: sizing...
2021-10-02 10:02:26: sized at { w: 1440, h: 2960 }
2021-10-02 10:02:26: swiping from { x: 720, y: 370 } to { x: 720, y: 2590 } for 300ms...
2021-10-02 10:02:27: swiped
2021-10-02 10:02:27: scrolled
```

As you can see, the scroll method results in a swipe being sent to the device. Now lets try and read some text from the screen:

```javascript
async function example_3 (tracing = false) {
    let device = new AndroidAutomate.Device().tracing(tracing);
    let url = 'https://en.wikipedia.org/wiki/Star_Trek:_The_Original_Series';
    let text = await device.browse(url).wait(2500).screen('example_3').shoot().crop({ x: 40, y: 410, w: 1350, h: 150 }).greyscale().read();

    console.log(`Read from page: '${ text }'`);
}
```

The cropping rectangle here is where Wikipedia places the page title - which I found by taking an earlier screenshot. Here is the output of this function:

```
2021-10-02 11:08:53: browsing to 'https://en.wikipedia.org/wiki/Star_Trek:_The_Original_Series'...
2021-10-02 11:08:53: browsed
2021-10-02 11:08:53: waiting for 2500ms...
2021-10-02 11:08:55: waited
2021-10-02 11:08:55: shooting 'example_3'...
2021-10-02 11:08:56: shot
2021-10-02 11:08:56: cropping 'example_3' at { x: 40, y: 410, w: 1350, h: 150 }...
2021-10-02 11:08:56: cropped
2021-10-02 11:08:56: greyscaling 'example_3'...
2021-10-02 11:08:56: greyscaled
2021-10-02 11:08:56: clean reading 'example_3'...
2021-10-02 11:08:56: read

Read from page: 'Star Trek: The Original Series'
```

So here, you can see the text has been successfully read. In practice reading text from inside an image can sometimes be challenging. I used ```crop``` and ```greyscale``` here to prepare the image for reading. Other operations you might want to use for this are ```sharpen``` and ```threshold```. Or you can go your own way and prepare the image yourself by using the ```file``` or ```sharp``` functions (as described in an earlier section of this document).

Lets take a look at some of the advanced screen functions:

```javascript
async function example_4 (tracing = false) {
    let device = new AndroidAutomate.Device().tracing(tracing);

    // this line makes two images, where the second one is a small section of the first
    await device.screen('example').shoot().clone('other').crop({ x: 10, y: 10, w: 100, h: 100 });

    // we now look for the smaller image inside the larger one
    let position = await device.screen('example').contains('other');

    // obviously in this small example, this should always return one result
    console.log(position);
}
```

The contains method looks for instances of one image, inside another. This is useful when you are trying to find the location of an on-screen element like a button or a sprite. The function returns an array of the position of each which is found. Here is the output:

```
2021-10-02 12:46:47: shooting 'example'...
2021-10-02 12:46:49: shot
2021-10-02 12:46:49: cloning 'example' to 'other'...
2021-10-02 12:46:49: cloned
2021-10-02 12:46:49: cropping 'other' at { x: 10, y: 10, w: 100, h: 100 }...
2021-10-02 12:46:49: cropped
2021-10-02 12:46:49: checking if 'example' contains at most 1 instance of 'other'...
2021-10-02 12:46:49: checked contained

[ { x: 10, y: 10, w: 100, h: 100 } ]
```

You can search for multiple instances of the smaller image, but this method can be relatively slow if you do that. By default it stops when it finds the first match.

```javascript
async function example_5 (tracing = false) {
    let device = new AndroidAutomate.Device().tracing(tracing);

    let points = [
       { x: 100, y: 100 },
       { x: 100, y: 200 },
       { x: 200, y: 100 }
    ]

    // extracts colors, but there is no match as we didn't send expected colors in
    let result = await device.screen('example').shoot().colors(points);
    console.log (util.inspect(result, { depth: null }));

    // extracts colors, and these should all match if the screen is static
    result = await device.screen('example').shoot().colors(result.colors);
    console.log (util.inspect(result, { depth: null }));
}
```

The ```colors``` function extracts the RGB values of the pixel points which you send in. If you also send in color values, it will also check that all your expected colors match what is on the screen.

```
2021-10-02 13:57:43: shooting 'example'...
2021-10-02 13:57:45: shot
2021-10-02 13:57:45: getting colors from 'example' at 3 points...
2021-10-02 13:57:45: got colors

{
  colors: [
    { x: 100, y: 100, c: { r: 1, g: 1, b: 1 } },
    { x: 100, y: 200, c: { r: 151, g: 131, b: 98 } },
    { x: 200, y: 100, c: { r: 93, g: 93, b: 93 } }
  ],
  matched: false
}

2021-10-02 13:57:45: shooting 'example'...
2021-10-02 13:57:47: shot
2021-10-02 13:57:47: getting colors from 'example' at 3 points...
2021-10-02 13:57:48: got colors

{
  colors: [
    { x: 100, y: 100, c: { r: 1, g: 1, b: 1 } },
    { x: 100, y: 200, c: { r: 151, g: 131, b: 98 } },
    { x: 200, y: 100, c: { r: 93, g: 93, b: 93 } }
  ],
  matched: true
}

```

This can be a useful to identify a screen by quickly inspecting only a small number of pixels within it.

Here is a more fun script:

```javascript
async function tiktok (count = 10, tracing = false) {
    let device = new AndroidAutomate.Device().tracing(tracing);

    let DELAY_START = 2500; // ms
    let DELAY_SWIPE = 5000; // ms

    let sz = await device.size();
    let hi = { x: sz.w / 2, y: sz.h / 2 - (sz.h / 4) };
    let lo = { x: sz.w / 2, y: sz.h / 2 + (sz.h / 4) };

    await device.start('com.zhiliaoapp.musically').wait(DELAY_START);

    for (let i = 0; i < count; i++) {
        await device.trace(`watching video ${i+1} of ${count}`).wait(DELAY_SWIPE).screen(`tiktok_${i+1}`).shoot().device().swipe(lo, hi);
    }
}
```

This function starts TikTok and swipes through a number of videos every 5 secs and takes a screenshot of each as it does.

```
2021-10-02 14:22:42: sizing...
2021-10-02 14:22:42: sized at { w: 1440, h: 2960 }
2021-10-02 14:22:42: starting 'com.zhiliaoapp.musically'...
2021-10-02 14:22:43: started
2021-10-02 14:22:43: waiting for 2500ms...
2021-10-02 14:22:45: waited
2021-10-02 14:22:45: watching video 1 of 5
2021-10-02 14:22:45: waiting for 5000ms...
2021-10-02 14:22:50: waited
2021-10-02 14:22:50: shooting 'tiktok_1'...
2021-10-02 14:22:52: shot
2021-10-02 14:22:52: swiping from { x: 720, y: 2220 } to { x: 720, y: 740 } for 300ms...
2021-10-02 14:22:53: swiped
2021-10-02 14:22:53: watching video 2 of 5
2021-10-02 14:22:53: waiting for 5000ms...
2021-10-02 14:22:58: waited
2021-10-02 14:22:58: shooting 'tiktok_2'...
2021-10-02 14:23:00: shot
2021-10-02 14:23:00: swiping from { x: 720, y: 2220 } to { x: 720, y: 740 } for 300ms...
2021-10-02 14:23:01: swiped

... etc
```

Here are two example functions which take a picture and take a video respectively:

```javascript
async function take_pic (tracing = false) {
    let device = new AndroidAutomate.Device().tracing(tracing);
    await device.camera();
    await device.wait(1000).press(AndroidAutomate.Keys.CAMERA)
    await device.wait(500).press(AndroidAutomate.Keys.HOME);
}

async function take_vid (secs = 5, tracing = false) {
    let device = new AndroidAutomate.Device().tracing(tracing);
    await device.camera(true);
    await device.wait(1000).press(AndroidAutomate.Keys.BUTTON_START);
    await device.wait(1000 * secs).press(AndroidAutomate.Keys.BUTTON_START)
    await device.wait(500).press(AndroidAutomate.Keys.BUTTON_SELECT)
    await device.wait(500).press(AndroidAutomate.Keys.HOME);
}
```

These functions record media on the local storage of the device. This media may then be auto-mirrored to a cloud service such as Google Photos. We have not (yet) implemented the protocols to retrieve local files from the device. This is possible, but does move somewhat beyond the remit of simple automation. You could always open the camera and then take a screenshot. Then the image will be auto-transferred to your script hosting machine:

```javascript
async function take_pic (tracing = false) {
    let device = new AndroidAutomate.Device().tracing(tracing);
    await device.camera().wait(1000).screen('picture').shoot().wait(500).device().press(AndroidAutomate.Keys.HOME);
}
```

Here are a couple of other quick examples. This first one outputs the names of all the people on the first page of your Whatsapp conversations:

```javascript
async function whatsapp (tracing = false) {
    const NAME_X = 255;
    const NAME_Y = 525;
    const NAME_W = 900;
    const NAME_H =  75;
    const NAME_D = 265;

    let device = new AndroidAutomate.Device().tracing(tracing);
    let size = await device.size();

    await device.start('com.whatsapp').wait(2000).screen('whatsapp').shoot();

    let names = [];
    let section = { x: NAME_X, y: NAME_Y, w: NAME_W, h: NAME_H }

    for ( ; section.y + NAME_H < size.h ; section.y += NAME_D) {
        names.push(await device.screen('whatsapp').clone('name').crop(section).read());
    }

    await device.screen('whatsapp').delete().screen('name').delete();

    console.log(names);
}
```

This implementation is both fragile (Whatsapp opens in its last state, not always on the conversation list) and specific (the measurements listed are specifically for my device). A more robust implementation is possible however, but somewhat beyond the scope of these simple demos.

Finally, here is the same function modified to send a message to a given person over Whatsapp:

```javascript
async function whatsapp_msg (who, msg, tracing = false) {
    const NAME_X =  255;
    const NAME_Y =  525;
    const NAME_W =  900;
    const NAME_H =   75;
    const NAME_D =  265;
    const TAP_X  =   25;
    const TAP_Y  =   25;
    const SEND_X = 1335;
    const SEND_Y = 1680;

    let device = new AndroidAutomate.Device().tracing(tracing);
    let size = await device.size();

    await device.start('com.whatsapp').wait(2000).screen('whatsapp').shoot();

    let section = { x: NAME_X, y: NAME_Y, w: NAME_W, h: NAME_H }

    for ( ; section.y + NAME_H < size.h ; section.y += NAME_D) {
        let name = await device.screen('whatsapp').clone('name').crop(section).read();

        if (name === who) {
            await device.tap({ x: section.x + TAP_X, y: section.y + TAP_Y }).wait(250).input(msg).wait(1000).tap({ x: SEND_X, y: SEND_Y });
            break;
        }
    }

    await device.screen('whatsapp').delete().screen('name').delete();
}
```

That's all for these small example functions. You can find more inspiration by examining the large demonstration application - a program which automatically plays the popular mobile puzzle game [FlowFree](https://www.bigduckgames.com/flowfree). There is more information on this in the [Demonstration](#demonstration) section.

Have fun!

_– [Pete Rai](http://pete.rai.org.uk/)_
