var vuetc = require('../');
var test = require('./test-stream');
var fs = require('fs');
var path = require('path');
var File = require('vinyl');
var should = require('should');
var assert = require('stream-assert');
var gulp = require('gulp');
require('mocha');

var fixtures = function (glob) { return path.join(__dirname, 'fixtures', glob); }
var thirdBase = __dirname,
    thirdFile = 'third.html',
    thirdPath = path.join(thirdBase, thirdFile);

describe('vuetc-gulp', function() {

  // Create a third fixture, so we'll know it has the latest modified stamp.
  // It must not live in the test/fixtures directory, otherwise the test
  // 'should take path from latest file' will be meaningless.
  before(function(done){
    fs.writeFile(thirdPath, 'console.log(\'third\');\n', done);
  });

  // We'll delete it when we're done.
  after(function(done){
    fs.unlink(thirdPath, done);
  });

  describe('vuetc()', function() {
    it('should throw, when arguments is missing', function () {
        vuetc.should.throw('vuetc-gulp: Missing file option');
    });

    it('should ignore null files', function (done) {
      var stream = vuetc('test.js');
      stream
        .pipe(assert.length(0))
        .pipe(assert.end(done));
      stream.write(new File());
      stream.end();
    });

    it('should emit error on streamed file', function (done) {
      gulp.src(fixtures('*'), { buffer: false })
        .pipe(vuetc('test.js'))
        .once('error', function (err) {
          err.message.should.eql('vuetc-gulp: Streaming not supported');
          done();
        });
    });

    it('should compile one file', function (done) {
      test('<template id="template1111"><app /></template>')
        .pipe(vuetc('test.js'))
        .pipe(assert.length(1))
        .pipe(assert.first(function (d) {
            d.contents.toString().should.startWith('var RenderedTemplate =')
            && d.contents.toString().should.match(/template1111/);
        }))
        .pipe(assert.end(done));
    });

    it('should compile multiple files', function (done) {
      test('<template id="template1111"><app /></template>', '<template id="template2222"><app /></template>')
        .pipe(vuetc('test.js'))
        .pipe(assert.length(1))
        .pipe(assert.first(function (d) {
            d.contents.toString().should.startWith('var RenderedTemplate =')
            && d.contents.toString().should.match(/template1111/)
            && d.contents.toString().should.match(/template2222/);
        }))
        .pipe(assert.end(done));
    });

    it('should preserve mode from files', function (done) {
      test('<template id="template1111"><app /></template>')
        .pipe(vuetc('test.js'))
        .pipe(assert.length(1))
        .pipe(assert.first(function (d) { d.stat.mode.should.eql(0666); }))
        .pipe(assert.end(done));
    });

    it('should take path from latest file', function (done) {
      gulp.src([fixtures('*'), thirdPath])
        .pipe(vuetc('test.js'))
        .pipe(assert.length(1))
        .pipe(assert.first(function (newFile) {
          var newFilePath = path.resolve(newFile.path);
          var expectedFilePath = path.resolve(path.join(thirdBase, 'test.js'));
          newFilePath.should.equal(expectedFilePath);
        }))
        .pipe(assert.end(done));
    });

    it('should preserve relative path from files', function (done) {
      test('<template id="template1111"><app /></template>', '<template id="template2222"><app /></template>')
        .pipe(vuetc('test.js'))
        .pipe(assert.length(1))
        .pipe(assert.first(function (d) { d.relative.should.eql('test.js'); }))
        .pipe(assert.end(done));
    });

    describe('should not fail if no files were input', function () {
      it('when argument is a string', function(done) {
        var stream = vuetc('test.js');
        stream.end();
        done();
      });

      it('when argument is an object', function(done) {
        var stream = vuetc({path: 'new.txt'});
        stream.end();
        done();
      });
    });

    describe('options', function () {
      it('should support integer indent', function (done) {
        test('<template id="template1111"><app /></template>')
          .pipe(vuetc('test.js', {indent: 5}))
          .pipe(assert.length(1))
          .pipe(assert.first(function (d) { d.contents.toString().should.match(/{\n\s{5}'template1111'/); }))
          .pipe(assert.end(done));
      })

      it('should support string indent', function (done) {
        test('<template id="template1111"><app /></template>')
          .pipe(vuetc('test.js', {indent: ' '.repeat(3)}))
          .pipe(assert.length(1))
          .pipe(assert.first(function (d) { d.contents.toString().should.match(/{\n\s{3}'template1111'/); }))
          .pipe(assert.end(done));
      })

      it('should support empty indent', function (done) {
        test('<template id="template1111"><app /></template>')
          .pipe(vuetc('test.js', {indent: ''}))
          .pipe(assert.length(1))
          .pipe(assert.first(function (d) { d.contents.toString().should.match(/{\n'template1111'/); }))
          .pipe(assert.end(done));
      })

      it('should support newLine', function (done) {
        test('<template id="template1111"><app /></template>')
          .pipe(vuetc('test.js', {newLine: '\r\n'}))
          .pipe(assert.length(1))
          .pipe(assert.first(function (d) { d.contents.toString().should.match(/{\r\n\s{2}'template1111'/); }))
          .pipe(assert.end(done));
      })

      it('should support empty newLine', function (done) {
        test('<template id="template1111"><app /></template>', '<template id="template2222"><app /></template>')
          .pipe(vuetc('test.js', {newLine: '', indent: ''}))
          .pipe(assert.length(1))
          .pipe(assert.first(function (d) { d.contents.toString().should.match(/{'template1111'/); }))
          .pipe(assert.end(done));
      })

        it('should support minify', function (done) {
        gulp.src([fixtures('*'), thirdPath])
          .pipe(vuetc('test.js', { minify: true }))
          .pipe(assert.length(2))
          .pipe(assert.first(function (newFile) {
            var newFilePath = path.resolve(newFile.path);
            var expectedFilePath = path.resolve(path.join(thirdBase, 'test.js'));
            newFilePath.should.equal(expectedFilePath);
          }))
          .pipe(assert.last(function (newFile) {
            var newFilePath = path.resolve(newFile.path);
            var expectedFilePath = path.resolve(path.join(thirdBase, 'test.min.js'));
            newFilePath.should.equal(expectedFilePath);
          }))
          .pipe(assert.end(done));
      });

    });

    describe('with object as argument', function () {
      it('should throw without path', function () {
        (function() {
          vuetc({ path: undefined });
        }).should.throw('vuetc-gulp: Missing path in file options');
      });

      it('should create file based on path property', function (done) {
        test('<template id="template1111"><app /></template>')
          .pipe(vuetc({path: 'new.txt'}))
          .pipe(assert.length(1))
          .pipe(assert.first(function (d) { d.path.should.eql('new.txt'); }))
          .pipe(assert.end(done));
      });

      it('should calculate relative path from cwd and path in arguments', function (done) {
        test('<template id="template1111"><app /></template>')
          .pipe(vuetc({cwd: path.normalize('/home/vuetc'), path: path.normalize('/home/vuetc/test/new.txt')}))
          .pipe(assert.length(1))
          .pipe(assert.first(function (d) { d.relative.should.eql(path.normalize('test/new.txt')); }))
          .pipe(assert.end(done));
      });
    });

  });
});
