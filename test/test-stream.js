var array = require('stream-array');
var File = require('vinyl');

module.exports = function () {
  var args = Array.prototype.slice.call(arguments);

  var i = 0;

  function create(contents) {
    return new File({
      cwd: '/home/vuetc/',
      base: '/home/vuetc/test',
      path: '/home/vuetc/test/file' + (i++).toString() + '.js',
      contents: new Buffer.from(contents),
      stat: {mode: 0666}
    });
  }

  return array(args.map(create))
};
