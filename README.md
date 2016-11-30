# Shimmed `AudioParam`s

`audio-param-shim` lets you create objects that work almost exactly like [`AudioParam`s](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam), except it doesn't actually touch any web audio stuff. Instead, one can subscribe for value changes and then do whatever one wants with that value.

All value scheduling methods are inherited from [`pseudo-audio-param`](https://github.com/mohayonao/pseudo-audio-param) by [@mohayonao](https://github.com/mohayonao).

### Features

* Create `AudioParam` shims with custom names and default, min and max values
* Scheduling values as you would on an `AudioParam`, such as with `exponentialRampToValueAtTime(value, time)`
* Subscribe to (and unsubscribe from) value changes so that you can act upon them

### Missing features

* Using `AudioNode`s to modulate the parameter value

### Use case

I'm working on an audio library that does it's own version of a built-in Web Audio API functionality. I do, however, want it to be completely interchangable. This means exposing an `AudioParam` API to the developer, hence this library.

### When not to use

If you want an extension that works directly on `AudioNode`s.


## Installation

```sh
npm i -S custom-audio-param
```


## Usage

```js
import createAudioParam from 'custom-audio-param'

// Create a NoiseParam class
const NoiseParam = createAudioParam('noise', 0.25, 0, 1)

// Create a param instance and change its value
const ctx = new AudioContext()
const noise = new NoiseParam(ctx)

noise.value = 0.4 // -> 0.4
noise.value = 4   // -> 1
noise.value = -1  // -> 0

// Change the value exponentially over 3 seconds and change the
// amount of noise accordingly
let noiseAmplitude = noise.value
// Use noiseAmplitude in a ScriptProcessorNode or something...

noise.subscribe(newValue => noiseAmplitude = newValue)
noise.exponentialRampToValueAtTime(0.9, ctx.currentTime + 3)
```


## API

### Top-level functions

##### `createAudioParam(name, defaultValue, minValue, maxValue)`

Returns a `AudioParamShim` class that looks and acts just like an `AudioParam` instance, except it doesn't actually touch any web audio stuff. Instead, one can subscribe for value changes and then do whatever one wants with that value.

| Argument       | Type    | Description                   |
| -------------- | ------- | ----------------------------- |
| `name`         | String  | The parameter's name          |
| `defaultValue` | Number  | The parameter's default value |
| `minValue`     | Number  | The parameter's minimum value |
| `maxValue`     | Number  | The parameter's maximum value |

### `AudioParamShim` API

#### Properties

| Property                  | Type   | Description                   |
| ------------------------- | ------ | ----------------------------- |
| `defaultValue` (readonly) | Number | The parameter's default value |
| `maxValue` (readonly)     | Number | The parameter's max value     |
| `minValue` (readonly)     | Number | The parameter's min value     |
| `name` (readonly)         | Number | The parameter's name          |

#### Methods

##### `subscribe(fn)`

Subscribes to value changes.

| Argument       | Type      | Description                   |
| -------------- | --------- | ----------------------------- |
| `fn`           | Function  | A callback function           |

##### `unsubscribe(fn)`

Unsubscribes from value changes.

| Argument       | Type      | Description                   |
| -------------- | --------- | ----------------------------- |
| `fn`           | Function  | A callback function           |


## Credits

* [@mohayonao](https://github.com/mohayonao) for creating [`pseudo-audio-param`](https://github.com/mohayonao/pseudo-audio-param)


## See also

* [mohayonao/pseudo-audio-param](https://github.com/mohayonao/pseudo-audio-param)
* [mohayonao/audio-param-transform](https://github.com/mohayonao/audio-param-transform)
* [mmckegg/custom-audio-node](https://github.com/mmckegg/custom-audio-node)
