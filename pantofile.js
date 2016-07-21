/**
 * Copyright (C) 2016 pantojs.xyz
 * pantofile.js
 *
 * changelog
 * 2016-07-20[20:00:54]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */
'use strict';

module.exports = panto => {
    panto.setOptions({
        src: 'src',
        output: 'output',
        cwd: __dirname
    });

    panto.loadTransformer('read', require('panto-transformer-read'));
    panto.loadTransformer('babel', require('panto-transformer-babel'));
    panto.loadTransformer('write', require('panto-transformer-write'));
    panto.loadTransformer('browserify', require('panto-transformer-browserify'));
    panto.loadTransformer('uglify', require('panto-transformer-uglify'));

    panto.$('**/*.jsx').tag('js').read().babel({
        extend: __dirname + '/.babelrc'
    }).browserify({
        bundle: 'bundle.js',
        entry: 'scripts/main.jsx'
    }).uglify().write();
};
