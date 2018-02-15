﻿'use strict';

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

    // to preserve existing |undefined| behaviour and to introduce |newLine: ""| for binaries
    if (typeof opt.newLine !== 'string') {
        opt.newLine = '\n';
    }

    var newLine = opt.newLine;
    var indent = '  ';

    var latestFile;
    var latestMod;
    var fileName;
    var renderedParts = [];


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
        var res = compiler.compile(node.content);

        if (renderedParts.length !== 0) {
            renderedParts.push(new Buffer(',' + newLine));
        }

        var textObj = indent + "'" + node.attrs['id'] + "': {" + newLine
            + indent + indent + "'render': function() {" + newLine
            + indent + indent + indent + res.render + newLine
            + indent + indent + "}," + newLine
            + indent + indent + "'staticRenderFns': " + (res.staticRenderFns.toString() || '[]') + newLine
            + indent + "}";

        renderedParts.push(new Buffer(textObj));
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
        //concat.add(file.relative, file.contents);
        addRenderedPart(file.contents);

        cb();
    }

    function endStream(cb) {
        // no files passed in, no file goes out
        if (!latestFile || !renderedParts) {
            cb();
            return;
        }

        var joinedFile;

        // if file opt was a file path
        // clone everything from the latest file
        if (typeof file === 'string') {
            joinedFile = latestFile.clone({ contents: false });
            joinedFile.path = path.join(latestFile.base, file);
        } else {
            joinedFile = new File(file);
        }

        renderedParts.unshift(new Buffer('var RenderedTemplate = {' + newLine));
        renderedParts.push(new Buffer(newLine + '};'));

        joinedFile.contents = Buffer.concat(renderedParts);

        this.push(joinedFile);
        cb();
    }

    return through.obj(bufferContents, endStream);
};