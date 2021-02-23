const Benchmark = require('benchmark')
const suite = new Benchmark.Suite()

const cssinjs = require('../dist/index.js')
const glamor = require('glamor')

const styles = {
  display: 'flex',

  '& div': {
    color: 'blue',
    backgroundColor: 'green',
  },
}

// Mocks
global.document = {
  querySelector: () => ({ appendChild: () => {} }),
  createElement: () => ({ setAttribute: () => {} }),
}

suite
  .add('cssinjs memoized', () => cssinjs.css(styles))
  .add('cssinjs raw', () => cssinjs.makeCss(styles))
  .add('glamor', () => glamor.css(styles).toString())
  .on('cycle', (ev) => console.log(String(ev.target)))
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
