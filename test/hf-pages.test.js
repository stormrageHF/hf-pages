const test = require('ava')
const hfPages = require('..')

// TODO: Implement module test
test('<test-title>', t => {
  const err = t.throws(() => hfPages(100), TypeError)
  t.is(err.message, 'Expected a string, got number')

  t.is(hfPages('w'), 'w@zce.me')
  t.is(hfPages('w', { host: 'wedn.net' }), 'w@wedn.net')
})
