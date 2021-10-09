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

Note: some CSS pseudo-classes require quotes and those quotes must still be
written inside JavaScript strings as though you are writing regular CSS:

JavaScript:

```js
css({
    '&::after': { content: `url("http://www.example.com/test.png")` },
})
// .fmcln77::after { content: url("http://www.example.com/test.png") }

css({
    '&::after': { content: `"/"` },
})
// .f1an8adg::after { content: "/" }

css({
    '&::after': { content: 'inherit' },
})
// .ft98pta::after { content: inherit }

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
  a: {
    textDecoration: 'underline',
    color: 'blue',

    '&:hover': { color: 'green' },
  },
})
```

CSS:
```css
a {
  color: blue;
  text-decoration: underline;
}
a:hover {
  color:green;
}
```

### Implementation notes

The contents of the JavaScript object will be inspected to produce
a deterministic `className` that can be reused in multiple places. Multiple
invocations of `css()` with the same value are idempotent and will only add the
generated CSS to the page once.

## Suggestions

Note: some examples below use React, but nothing about this library is specific
to React. Any UI toolkit that can pass a class to an HTML node, including
vanilla DOM APIs, can make use of this.

### Don't: rely on the order of styles

CSS specificity rules apply as usual with the exception of _order_. This is
because JavaScript objects are inherently _unordered_.

For example, an entirely valid CSS strategy is to use a shorthand property for
most values, and then to follow that with an override for any remaining
properties. This works because CSS purposefully processes styles in top-down
order where last wins.

```css
border-top: 1px solid;
border-color: blue;
```

However the same strategy will not always work with this library. In JavaScript
the order of keys in an object is _not_ stable. In order to produce
a deterministic hash from an undeterministic object the object keys will be
sorted lexicographically to generate the resulting CSS.

Sometimes that will produce the desired result (in the case of, say, `border`
and `borderBottom`), but other times it will not. In the example above the `c`
in `border-color` will sort above the `t` in `border-top` producing an
undesired result.

It is ok to use shorthand properties! But avoid mix-and-matching shorthand
properties with full properties within the same style.

```js
// Don't do this because borderColor may not be processed after borderTop:
css({
  borderTop: '1px solid',
  borderColor: 'blue',
})

// Instead do this because the order of processing will not matter:
css({
  borderTopWidth: '1px',
  borderTopStyle: 'solid',
  borderColor: 'blue',
})

// It's also ok to increase the specificity of the override to take
// precedence over order:
css({
  borderTop: '1px solid',

  '& .active': { borderColor: 'blue' },
})

```

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

```js
const MyComponent = () => {
  return (
    <ul className={className}>
      {navigationLinks.map((nav, idx) => (
        <li
          key={idx}
          className={`nav-item ${nav.href === window.location.pathname ? 'active' : ''`}
        >
          <a href={x.href}>{x.linkText}</a>
        </li>
      )}
    </ul>
  )
}

const className = css({
  '& .nav-item': { cursor: 'pointer' },
  '& .nav-item.active': { cursor: 'not-allowed' },
})
```

### Do: make use of helper functions

```js
import classnames from 'classnames'
const matchesCur = path => path === window.location.pathname

const MyComponent = () => {
  return (
    <ul className={className}>
      {navigationLinks.map((nav, idx) => (
        <li
          key={idx}
          className={classnames({
            'nav-item': true,
            'active': matchesCur(nav.href),
          })}
        >
          <a href={nav.href}>{nav.linkText}</a>
        </li>
      )}
    </ul>
  )
}

const className = css({
  '& .nav-item': { cursor: 'pointer' },
  '& .nav-item.active': { cursor: 'not-allowed' },
})
```

### Do: pretend you're writing regular CSS

Create CSS classes as you would if you were writing CSS in a regular .css file
and use JavaScript to toggle classes on and off. This works great for
CSS animations too.

```js
const MyComponent = () => {
  const [focusedSection, setFocus] = useState('foo')
  const isFocused = name => name === focusedSection ? 'foreground' : 'background'

  return (
    <div className={className}>
      <div onClick={() => setFocus('foo')} className={isFocused('foo')}>Foo</div>
      <div onClick={() => setFocus('bar')} className={isFocused('bar')}>Bar</div>
    </div>
  )
}

const className = css({
  div: {
    width: '200px',
    height: '200px',
    cursor: 'pointer',
    transition: 'background-color 0.5s',
  },

  '& .foreground': { backgroundColor: 'darkblue' },
  '& .background': { backgroundColor: 'lightblue' },
})
```

### Don't: programmatically generate CSS

This system will not de-duplicate any CSS styles. If the contents of the CSS
object produce a unique combination styles then that will be added to the page.

Be wary of calling `css()` programmatically or wrapping it in a function that
accepts parameters and generates CSS depending on those parameters.

This pattern is fine if done sparingly -- for example, once or twice to
initialize CSS values for a site-wide theme or themes. But if done frequently
it can easily lead to thousands or more of style sheets in the page head.

```js
const genRandomColor = () => '#' + (0x1000000 + Math.random() * 0xffffff)
  .toString(16)
  .substr(1, 6)

const MyComponent = () => {
  const [className, setClassName] = useState('#ffffff')

  useEffect(() => {
    // Randomly change the background color every 100 ms.
    setInterval(() => {
      // ...generate unique styles for each of the (potentially) 65k colors
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

### Don't: worry (too much) about performance

It's ok to call `css()` inside a `render()` function that gets called
frequently. The CSS object is memoized and will not be processed again if the
same object is passed multiple times. If the CSS object is different but the
contents of that object have been seen before the CSS will generated again but
not be re-added to the page -- generating CSS is fast and deterministic.

That said, if there's not a reason to do that it's worth avoding to reduce
needless processing. Good reasons are generating CSS from a prop or a hook, say
for the current site theme. (Please note the caveat about generating CSS
above!)

See `benchmarks.js` for more information.

```js
const MyComponent = (props) => {
  return (
    <div className={css({color: props.theme.textColor})}>
      Foo
    </div>
  )
}

// or

const MyComponent = () => {
  const theme = useTheme()
  const className = css({color: theme.textColor})

  return (
    <div className={className}>
      Foo
    </div>
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

1.  Run `npm version [major|minor|patch]` to build the project and tag a new
    version.
2.  Push the new Git commit and new tag to the repository (referenced as the
    'origin' remote in this example):
    ```
    git push origin master
    git push origin <new-tag-here>
    ```
3.  Run `npm publish` to deploy the source and build artifacts to npm.
