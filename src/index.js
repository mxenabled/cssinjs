import { insertCss } from 'insert-css'

// Import ES5 build until _all_ our FE projects no longer support IE11.
import * as FreeStyle from 'free-style/dist.es5/index.js'

// Function composition
const compose = (f, g) => (...args) => f(g(...args))

// Run a function then discard the return value
const discard = (f) => (...args) => (f(...args), undefined)

/**
Memoize seen CSS objects to avoid re-calculating styles unnecessarily

Although free-style is quite fast, the memory requirements of a WeakMap are
small so this is a good memory-for-cpu tradeoff. See the benchmarks file for
details.

TODO: Borrow inspiration from Glamor and use a WeakMap to allow for possible
garbage collection of the keyed objects. That said, I don't think that will
actually matter to us until we provide an additional cleanup mechanism to
remove styles from the page head. Free-style allows for this but it will
require additional tracking machinery so we can revisit this if it matters.
**/
export const memo = (fn) => {
  const seenObs = new WeakMap()

  return (x) => {
    const cache = seenObs.get(x)
    if (cache !== undefined) return cache

    const ret = fn(x)
    seenObs.set(x, ret)
    return ret
  }
}

/**
Remember all classes and conditionally add any new CSS to the main style tag

Unlike memoization above, this is less about performance and more about
avoiding the memory-leak of adding duplicate styles to the style tag.
**/
const insertCss = (() => {
  const seenClassNames = {}

  return ([className, styles]) => {
    if (!seenClassNames[className] === undefined) {
      insertCss(styles)
    }
    return className
  }
})()

/**
Create a deterministic className and a string of CSS suitable for inserting
into the page
**/
export const makeCss = (cssObj) => {
  const type = typeof cssObj
  if (!(cssObj != null && (type == 'object' || type == 'function'))) {
    throw new Error('CSS must be an object of key/value pairs.')
  }

  const style = FreeStyle.create()
  const className = style.registerStyle(cssObj)
  return [className, style.getStyles()]
}

/**
A wrapper to set the global flag
**/
export const makeGlobal = (cssObj) => makeCss({ $global: true, ...cssObj })

/**
A wrapper to overload arguments to use optional or generated identifier
**/
export const makeKeyframes = (arg1, arg2) => {
  const [cssObj, animName] = arg2 === undefined ? [arg1, '&'] : [arg2, arg1]

  if (!(typeof animName === 'string' || animName instanceof String)) {
    throw new Error('Animation name must be a string. Omit argument to auto-generate.')
  }

  const [className, styles] = makeCss({ $global: true, [`@keyframes ${animName}`]: cssObj })
  return [arg2 === undefined ? className : animName, styles]
}

// --- Public API

/**
Insert namespaced CSS from a JS object and return the namespace for use as
a className
**/
export const css = compose(insertCss, memo(makeCss))

/**
Insert globally available CSS from a JS object

NOTE: we're not memoizing here because in order to create global styles we have
to either make a shallow copy of the CSS object the user passes, or we have to
mutate that object, and either approach would have memoization implications.
Since globals are used rarely, this isn't worth the engineering effort.
**/
export const global = compose(discard, insertCss, makeGlobal)

/**
Insert namespaced keyframe CSS and return the supplied/generated identifier for
use with an animation-name property

NOTE: we're not memoizing here because in order to create global styles we have
to either make a shallow copy of the CSS object the user passes, or we have to
mutate that object, and either approach would have memoization implications.
Since keyframes are used rarely, this isn't worth the engineering effort.
**/
export const keyframes = compose(insertCss, makeKeyframes)
