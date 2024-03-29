import { suite } from 'uvu'
import * as assert from 'assert'

import { css, global, keyframes, makeCss, makeGlobal, makeKeyframes, memo } from '../index.js'

/*
Dumb, low-value tests copied from the README to verify basic functionality and
to detect potential changes in upstream deps.
*/
const basic = suite('basic')

basic('basic usage', () => {
  const [className, styles] = makeCss({
    color: 'white',
    backgroundColor: 'black',
  })

  assert.equal(className, 'f6e2hlp')
  assert.equal(styles, '.f6e2hlp{background-color:black;color:white}')
})

basic('nested usage', () => {
  const [className, styles] = makeCss({
    backgroundColor: 'black',

    '& .foo': { color: 'white' },

    '& #myid ~ ul > li:last-child': { color: 'green' },

    '& .foo.bar': {
      '& span.baz': {
        color: 'red',
      },
    },
  })

  assert.equal(className, 'f1wuspsr')
  assert.equal(
    styles,
    '.f1wuspsr{background-color:black}.f1wuspsr .foo{color:white}.f1wuspsr #myid ~ ul > li:last-child{color:green}.f1wuspsr .foo.bar span.baz{color:red}',
  )
})

basic('pseudo usage', () => {
  const [className, styles] = makeCss({
    '& > ul': {
      listStyleType: 'none',
      paddingLeft: '0',

      '& li': {
        cursor: 'pointer',

        '&:hover': {
          backgroundColor: 'yellow',
        },
      },
    },
  })

  assert.equal(className, 'fodl7pe')
  assert.equal(
    styles,
    '.fodl7pe > ul{list-style-type:none;padding-left:0}.fodl7pe > ul li{cursor:pointer}.fodl7pe > ul li:hover{background-color:yellow}',
  )
})

basic('media usage', () => {
  const [className, styles] = makeCss({
    '@media(min-width: 300px)': {
      '& h2': { fontSize: '30px' },
    },
  })

  assert.equal(className, 'fdnu0l2')
  assert.equal(styles, '@media(min-width: 300px){.fdnu0l2 h2{font-size:30px}}')
})

basic('keyframes custom name usage', () => {
  const [kclassName, kstyles] = makeKeyframes('custom-name-here', {
    from: { color: 'red' },
    to: { color: 'blue' },
  })

  const [cclassName, cstyles] = makeCss({
    animationName: kclassName,
    animationDuration: '1s',
  })

  assert.equal(kclassName, 'custom-name-here')
  assert.equal(kstyles, '@keyframes custom-name-here{from{color:red}to{color:blue}}')

  assert.equal(cclassName, 'fgiup2j')
  assert.equal(cstyles, '.fgiup2j{animation-duration:1s;animation-name:custom-name-here}')
})

basic('keyframes auto name usage', () => {
  const [kclassName, kstyles] = makeKeyframes({
    '0%': { color: 'red' },
    '60%': { color: 'purple' },
    '100%': { color: 'blue' },
  })

  const [cclassName, cstyles] = makeCss({
    animationName: kclassName,
    animationDuration: '1s',
  })

  assert.equal(kclassName, 'f167zcak')
  assert.equal(kstyles, '@keyframes f167zcak{0%{color:red}100%{color:blue}60%{color:purple}}')

  assert.equal(cclassName, 'fqkhao0')
  assert.equal(cstyles, '.fqkhao0{animation-duration:1s;animation-name:f167zcak}')
})

basic('global usage', () => {
  const [className, styles] = makeGlobal({
    a: {
      color: 'blue',
      textDecoration: 'underline',
      '&:hover': { color: 'green' },
    },
  })

  assert.equal(className, 'f1uki7ri')
  assert.equal(styles, 'a{color:blue;text-decoration:underline}a:hover{color:green}')
})

basic.run()

// ---

/**
Tests for library internals
**/
const internals = suite('internals')

internals('consistent hash; different object identities', () => {
  const obj = { color: 'white' }

  const [className1] = makeCss(obj)
  const [className2] = makeCss({ ...obj })

  assert.equal(className1, className2)
})

internals('memoize same object', () => {
  const fn = memo(makeCss)
  const obj = { color: 'white' }

  const [className1, styles1] = fn(obj) // cache miss
  const [className2, styles2] = fn(obj) // cache hit

  assert.equal(className1, className2)
  assert.equal(styles1, styles2)
})

internals('memoize different objects', () => {
  const fn = memo(makeCss)
  const obj = { color: 'white' }

  // No great way to test this externally.
  const [className1, styles1] = fn({ ...obj }) // cache miss
  const [className2, styles2] = fn({ ...obj }) // cache miss

  assert.equal(className1, className2)
  assert.equal(styles1, styles2)
})

internals.run()

// ---

/**
Tests for the public API
**/
const pubapi = suite('pubapi')

pubapi.before.each(() => {
  // Mocks
  globalThis.styleElement = { cssText: '' }
  globalThis.document = {
    querySelector: () => ({ appendChild: () => {} }),
    createElement: () => ({
      styleSheet: globalThis.styleElement,
      setAttribute: () => {},
    }),
  }
})

pubapi.after.each(() => {
  delete globalThis.styleElement
  delete globalThis.document
})

pubapi('add styles to head only once', () => {
  const className1 = css({ '.foo': { color: 'blue' } })
  const className2 = css({ '.foo': { color: 'blue' } })

  assert.equal(className1, className2)
  assert.equal(styleElement.cssText, '.ffqhmej .foo{color:blue}')
})

pubapi('global styles are present', () => {
  const className1 = global({
    a: {
      color: 'blue',
      textDecoration: 'underline',
      '&:hover': { color: 'green' },
    },
  })

  assert.equal(className1, undefined)
  assert.equal(styleElement.cssText, 'a{color:blue;text-decoration:underline}a:hover{color:green}')
})

pubapi.run()

// ---

const bugs = suite('bugs')

bugs(`selector lists with pseudo classes don't explode`, () => {
  const [className, result] = makeCss({
    '& > input, & .something-else > input': {
      background: 'blue',
      '&:focus': { background: 'green' },
    },
  })

  assert.equal(className, 'f1v7ffqg')
  assert.doesNotMatch(result, /\.f1v7ffqg > input:focus/)
})

bugs.run()
