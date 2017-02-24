import PseudoAudioParam from 'pseudo-audio-param'
import invariant from 'invariant'
import isNumber from 'lodash.isnumber'
import { readonly, nonenumerable, nonconfigurable } from 'core-decorators'

const globalContext = typeof global !== 'undefined' ? global : window
const AudioContextConstructor = globalContext.AudioContext || globalContext.webkitAudioContext

/**
 * Returns a constructor/class/function that looks and acts just like an
 * `AudioParam` instance, except it doesn't actually touch any web audio
 * stuff. Instead, one can subscribe for value changes and then do whatever
 * one wants with that value.
 *
 * @param  {String} name          The parameter's name
 * @param  {Number} defaultValue  The parameter's default value
 * @param  {Number} minValue      The parameter's minimum value
 * @param  {Number} maxValue      The parameter's maximum value
 * @return {Function}             A AudioParamShim class
 */
export default function createAudioParam(name, defaultValue, minValue, maxValue) {

  // Check that we have an `(webkit)AudioContext`
  if (AudioContextConstructor === undefined) {
    throw new TypeError(
      'Neither AudioContext nor webkitAudioContext is available on the global scope. ' +
      'If you\'re in a node.js environment you need to polyfill it, ' +
      'perhaps with https://github.com/sebpiq/node-web-audio-api?'
    )
  }

  // Make sure we have what we need
  invariant(typeof name === 'string' && name.trim().length > 0, 'You must provide a non-empty parameter name to createAudioParam(name, defaultValue, minValue, maxValue)')
  invariant(isNumber(defaultValue), 'You must provide a numeric default value to createAudioParam(name, defaultValue, minValue, maxValue)')
  invariant(isNumber(minValue), 'You must provide a numeric min value to createAudioParam(name, defaultValue, minValue, maxValue)')
  invariant(isNumber(maxValue), 'You must provide a numeric max value to createAudioParam(name, defaultValue, minValue, maxValue)')
  invariant(defaultValue >= minValue, `The default value ${defaultValue} cannot be lesser than the minimum value ${minValue}`)
  invariant(defaultValue <= maxValue, `The default value ${defaultValue} cannot be greater than the maximum value ${maxValue}`)

  /**
   * A bespoke, hand-crafted audio param shim class having the
   * same API as real `AudioParam`.
   */
  class AudioParamShim extends PseudoAudioParam {

    /**
     * Constructor
     *
     * @param  {AudioContext} context  An AudioContext instance
     * @return {Function}              A custom audio param constructor
     * @throws {TypeError}             If context is not an instance if `(webkit)AudioContext`
     */
    constructor(context) {
      super()

      if (context instanceof AudioContextConstructor === false) {
        throw new TypeError(`The provided context is not an AudioContext or webkitAudioContext`)
      }

      this.context = context
      this.value = this.defaultValue

      let currentValue = this.value

      const update = () => {
        if (currentValue !== this.value) {
          this._subscribers.forEach(fn => fn(currentValue))
          currentValue = this.value
        }

        if (typeof window !== 'undefined') {
          window.requestAnimationFrame(update)
        }
        else {
          setTimeout(update, 16) // 60 fps
        }
      }

      update()
    }

    /**
     * The parameter's name
     */
    @nonenumerable
    @nonconfigurable
    @readonly
    name = name.trim()

    /**
     * An array of callback functions that gets notify of value changes
     */
    @nonenumerable
    _subscribers = []

    /**
     * Returns the parameter's current value
     *
     * @return {Number} The parameter's current value
     */
    get value() {
      return this.getValueAtTime(this.context.currentTime)
    }

    /**
     * Sets the parameter's value to a new value. The new value is clamped inside
     * to range given by `minValue` and `maxValue`.
     *
     * @param  {Number} value  A new value
     */
    set value(value) {
      let clampedValue = value

      if (value > this.maxValue) {
        console.warn(`The value ${value} is greater than the max value ${this.maxValue}`)
        clampedValue = this.maxValue
      }
      if (value < this.minValue) {
        console.warn(`The value ${value} is lesser than the min value ${this.minValue}`)
        clampedValue = this.minValue
      }

      this.setValueAtTime(clampedValue, this.context.currentTime)
    }

    /**
     * The parameter's default value
     */
    @readonly
    @nonconfigurable
    defaultValue = defaultValue

    /**
     * The parameter's minimum value
     */
    @readonly
    @nonconfigurable
    minValue = minValue

    /**
     * The parameter's maximum value
     */
    @readonly
    @nonconfigurable
    maxValue = maxValue

    /**
     * Adds a functions to the list of callback functions that are invoked
     * with the parameter's value whenever it changes.
     *
     * @param  {Function} fn  A callback function
     */
    subscribe(fn) {
      this._subscribers = [...this._subscribers, fn]
    }

    /**
     * Removes a function from the list of callback functions that are invoked
     * with the parameter's value whenever it changes.
     *
     * @param  {Function} fn  The callback function to remove
     */
    unsubscribe(fn) {
      this._subscribers = this._subscribers.filter(subscriber => subscriber !== fn)
    }
  }

  return AudioParamShim
}
