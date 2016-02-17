
var builder = require('../builder');

var cmd = {
  build: 'rollup -f umd -n Observable index.js -o dist/observable.js',
  uglify: 'uglifyjs dist/observable.js -cmo dist/observable.min.js'
}

builder(function (exec, watch) {
  exec(cmd.build, cmd.uglify);
  watch('index.js', cmd.build, cmd.uglify);
});
