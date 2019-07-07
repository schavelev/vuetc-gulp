'use strict';

var through = require('through2');
var path = require('path');
var File = require('vinyl');
var compiler = require('vue-template-compiler');

// file can be a vinyl file object or a string
// when a string it will construct a new one
module.exports = function (file, opt) {
    if (!file) {
        throw new Error('vuetc-gulp: Missing file option');
    }
    opt = opt || {};

    var indent = typeof(opt.indent) === 'number' ? ' '.repeat(opt.indent) : ' '.repeat(2);
    if (typeof (opt.indent) === 'string') indent = ' '.repeat(opt.indent.length);
    var pushMinify = opt.minify;

    var newLine = typeof(opt.newLine) === 'string' ? opt.newLine : '\n';

    var latestFile;
    var latestMod;
    var fileName;
    var renderedTemplates = [];

    if (typeof file === 'string') {
        fileName = file;
    } else if (typeof file.path === 'string') {
        fileName = path.basename(file.path);
    } else {
        throw new Error('vuetc-gulp: Missing path in file options');
    }

    function addRenderedPart(content) {
        function idAttr(el, idx, arr) {
            return el.name === "id";
        } 

        var node = compiler.parseComponent(content.toString()).template;
        // ignore empty node content
        if (!node) {
            return;
        }

        var res = compiler.compile(node.content);
        var staticRenderFns = res.staticRenderFns.map(function(fn) {
            return 'function(){' + fn + '}';
        });

        renderedTemplates.push({
            node_id: node.attrs['id'],
            render: res.render,
            staticRenderFns: '[' + staticRenderFns.join(',') + ']'
        });        
    }

    function getJoinedFile(isCompact) {
        var nl = isCompact ? '' : newLine;
        var tab = isCompact ? '' : indent;

        var joinedFile;
        var bufferParts = [];

        // if file opt was a file path
        // clone everything from the latest file
        if (typeof file === 'string') {
            joinedFile = latestFile.clone({ contents: false });
            joinedFile.path = path.join(latestFile.base, file);
        } else {
            joinedFile = new File(file);
        }

        if (isCompact) {
            var pathObject = path.parse(joinedFile.path);
            joinedFile.path = path.format({
                dir: pathObject.dir,
                name: pathObject.name + '.min',
                ext: pathObject.ext
            });
        }

        bufferParts.push(Buffer.from('var RenderedTemplate = {' + nl));
        renderedTemplates.forEach(function (item, i) {
            var textObj = (i > 0) ? (',' + nl) : '';

            textObj += tab + "'" + item.node_id + "': {" + nl
                + tab.repeat(2) + "'render': function() {" + nl
                + tab.repeat(3) + item.render + nl
                + tab.repeat(2) + "}," + nl
                + tab.repeat(2) + "'staticRenderFns': " + (item.staticRenderFns || '[]') + nl
                + tab + "}";

            bufferParts.push(Buffer.from(textObj));            
        })
        bufferParts.push(Buffer.from(nl + '};'));

        joinedFile.contents = Buffer.concat(bufferParts);

        return joinedFile;
    } 

    function bufferContents(file, enc, cb) {
        // ignore empty files
        if (file.isNull()) {
            cb();
            return;
        }

        // we don't do streams (yet)
        if (file.isStream()) {
            this.emit('error', new Error('vuetc-gulp: Streaming not supported'));
            cb();
            return;
        }

        // set latest file if not already set,
        // or if the current file was modified more recently.
        if (!latestMod || file.stat && file.stat.mtime > latestMod) {
            latestFile = file;
            latestMod = file.stat && file.stat.mtime;
        }

        // add file to concat instance
        addRenderedPart(file.contents);

        cb();
    }

    function endStream(cb) {
        // no files passed in, no file goes out
        if (!latestFile || !renderedTemplates) {
            cb();
            return;
        }

        this.push(getJoinedFile(false));
        if (pushMinify)
            this.push(getJoinedFile(true));

        cb();
    }

    return through.obj(bufferContents, endStream);
};