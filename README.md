# CSS-in-JS

Write CSS as nested JS object notation; get a unique className back. That's it.

A thin, declarative, no-frills, "only one way to do it" wrapper around the
excellent and lightweight
[free-style](https://github.com/blakeembrey/free-style) library.

## Documentation

There are three export functions:

```js
import { css, global, keyframes } from '@mxenabled/cssinjs'
```

Write regular, vanilla CSS in JavaScript object notation:

```js
const className = css({
  color: 'white',
  backgroundColor: 'black',
})
```

CSS added to the document:
```css
.f6e2hlp {
  background-color: black;
  color: white;
}
```

The generated `className` is a unique string that can be added to any HTML
element to style it and its children using regular CSS semantics.

*Caveat*: CSS specficity rules apply as usual with the exception of _order_.
This is because JavaScript objects are unordered. Do not rely on order.

### Nesting and parent references

The CSS object may include nested objects. The keys of those nested objects may
contain any valid CSS selector. The `&` symbol references the parent style.

JavaScript:
```js
css({
  backgroundColor: 'black',

  '& .foo': { color: 'white' },

  '& #myid ~ ul > li:last-child': { color: 'green' },

  '& .foo.bar': {
    '& span.baz': {
      color: 'red',
    },
  },
})
```

CSS:
```css
.f1wuspsr {
  background-color: black;
}
.f1wuspsr .foo {
  color: white;
}
.f1wuspsr #myid ~ ul > li:last-child {
  color: green;
}
.f1wuspsr .foo.bar span.baz {
  color: red;
}
```

### Pseudo-selectors

JavaScript:
```js
css({
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
```

CSS:
```css
.fodl7pe > ul {
  list-style-type: none;
  padding-left: 0;
}
.fodl7pe > ul li {
  cursor: pointer;
}
.fodl7pe > ul li:hover {
  background-color: yellow;
}
```

### Media queries

JavaScript:
```js
css({
  '@media(min-width: 300px)': {
    '& h2': { fontSize: '30px' },
  },
})
```

CSS:
```css
@media (min-width: 300px) {
  .fdnu0l2 h2 {
    font-size: 30px;
  }
}
```

### Keyframes

The special `keyframes` function takes key/value pairs used for a CSS
`@keyframes` rule and returns a string identifier that can be used in an
`animation-name` rule.

It can be called in two ways:

1.  If you wish to manually specify the animation name pass a string you wish
    to use as the first argument and the CSS object as the second argument:

    JavaScript:
    ```js
    const colorAnimation = keyframes('custom-name-here', {
      from: { color: 'red' },
      to: { color: 'blue' },
    })

    const className = css({
      animationName: colorAnimation,
      animationDuration: '1s',
    })
    ```

    CSS:
    ```css
    @keyframes custom-name-here {
      from {
        color: red;
      }
      to {
        color: blue;
      }
    }

    .f17e5e93 {
      animation-duration: 1s;
      animation-name: custom-name-here;
      animation-name: @keyframes custom-name-here {
        from {
          color: red;
        }
        to {
          color: blue;
        }
      }
    }
    ```

2.  If you prefer an automatically generated animation name then simply pass
    the CSS object as a single argument.

    JavaScript:
    ```js
    const colorAnimation = keyframes({
      '0%': { color: 'red' },
      '60%': { color: 'purple' },
      '100%': { color: 'blue' },
    })

    const className = css({
      animationName: colorAnimation,
      animationDuration: '1s',
    })
    ```

    ```css
    @keyframes f167zcak {
      0% {
        color: red;
      }
      100% {
        color: blue;
      }
      60% {
        color: purple;
      }
    }

    .f1inlm1z {
      animation-duration: 1s;
      animation-name: f167zcak;
      animation-name: @keyframes f167zcak {
        0% {
          color: red;
        }
        100% {
          color: blue;
        }
        60% {
          color: purple;
        }
      }
    }
    ```

If you do not plan to reference an animation-name in more than one place, you
may simply specify it inline:

```js
const className = css({
  animationName: keyframes({
    '0%': { color: 'red' },
    '60%': { color: 'purple' },
    '100%': { color: 'blue' },
  }),

  animationDuration: '1s',
})

```

## Global styles

Global CSS styles, without a namespace, may be created with the `global()`
function. It does not return a value.

JavaScript:
```js
global({
  fontFamily: `"Comic Sans MS", "Comic Sans", cursive`,
})
```

CSS:
```css
font-family: 'Comic Sans MS', 'Comic Sans', cursive;
```

### Implementation notes

The contents of the JavaScript object will be inspected to produce
a deterministic `className` that can be reused in multiple places. Multiple
invocations of `css()` with the same value are idempotent and will only add the
generated CSS to the page once.

## Suggestions

### Do: reference values and variables

The syntax is JavaScript. Use it!

```js
css({
  '& h1': {
    ...mixins.headers.h1,
  },

  '& .someEl': {
    backgroundColor: theme.colors.gray100,
  },

  [`@media (max-width: ${theme.BreakPoints.medium}px)`]: { /* ... */ },
})
```

### Do: make use of multiple classes

### Do: pretend you're writing regular CSS

Create CSS classes as you would if you were writing CSS in a regular .css file
and use JavaScript to toggle classes on and off. This works great for
CSS animations too.

```js
const MyComponent = () => {
  const [focusedSection, setFocus] = useState('foo')

  <div className={className}>
      <div className={focusedSection === 'foo' ? 'foreground' : 'background'}>Foo</div>
      <div className={focusedSection === 'bar' ? 'foreground' : 'background'}>Bar</div>
  </div>
}

const className = css({
  '& .foreground': { backgroundColor: 'white' },
  '& .background': { backgroundColor: 'gray' },
})
```

### Don't: programmatically generate CSS

This system will not de-duplicate any CSS styles. If the contents of the CSS
object produce a unique combination style then that will be added to the page.

In general be wary of calling `css()` programmatically or wrapping it in
a function that accepts parameters and generates CSS depending on those
parameters. That pattern is fine if done sparingly -- for example, once as the
app is first loading to initialize CSS values for a site-wide theme. But if
done frequently it can lead to memory concerns.

```js
const genRandomColor = () => '#' + (0x1000000 + Math.random() * 0xffffff)
  .toString(16)
  .substr(1, 6)

const MyComponent = () => {
  const [className, setClassName] = useState('#ffffff')

  useEffect(() => {
    setInterval(() => {
      const newClassName = css({
        width: '100px',
        height: '100px',
        backgroundColor: genRandomColor(),
      })

      setClassName(newClassName)
    }, 100)
  }, [])

  return (
    <div className={className} />
  )
}
```

## Development

1.  The source files live in the `src` directory and the build files will be
    written to `dist`.

    These are written as ES5 and should be consumable by a bundler directly. We
    can relax this requirement and simplify the build process once all our
    frontend projects no longer need to support IE11.

2.  Run `npm start` to start a watcher that will rebuild files as they change.

3.  Run `npm run watch` to start a watcher that will run the test suite as
    build files change. (Note, you will also need the build watcher running.)

### Benchmarks

1.  Manually run `npm install --no-save benchmark glamor`.

    These are not in `optionalDependencies` to not install them, and associated
    dependencies, with a default install.

2.  Run `npm run test:benchmarks`.

## Release

1.  Run `npm version` to build the project and tag a new version.

<!-- TODO:
2.  Run `npm publish` to deploy the new version to npm.
-->
