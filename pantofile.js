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
const path = require('path');

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
    panto.loadTransformer('integrity', require('panto-transformer-integrity'));
    panto.loadTransformer('aspect', require('panto-transformer-aspect'));
    panto.loadTransformer('replace', require('panto-transformer-replace'));
    panto.loadTransformer('less', require('panto-transformer-less'));
    panto.loadTransformer('resource', require('panto-transformer-resource'));
    panto.loadTransformer('stamp', require('panto-transformer-stamp'));

    let scriptIntegrity, styleIntegrity;

    const RES_MAP = new Map();

    // Clear first
    panto.on('start', () => {
        scriptIntegrity = styleIntegrity = undefined;
        RES_MAP.clear();
    });

    const WRITE_ORIGIN = {
        destname: file => path.join(path.dirname(file.filename), file.stamp)
    };

    // Image
    panto.$('**/*.{jpg,png,gif}').tag('image').read().stamp().aspect({
        aspect: file => RES_MAP.set(file.filename, path.join(path.dirname(file.filename), file.stamp))
    }).write(WRITE_ORIGIN);

    // LESS
    panto.$('styles/main.less').tag('less').read().less({
        lessOptions: {
            compress: true
        }
    }).resource({
        getResourceAlias: (resname, filename) => path.relative(path.dirname(filename), RES_MAP.get(resname))
    }).stamp().integrity().aspect({
        aspect: file => {
            styleIntegrity = file.integrity;
            RES_MAP.set(file.filename, path.join(path.dirname(file.filename), file.stamp));
        }
    }).write(WRITE_ORIGIN);

    // JSX
    panto.$('**/*.jsx').tag('js').read().babel({
        extend: __dirname + '/.babelrc'
    }).browserify({
        bundle: 'scripts/bundle.js',
        entry: 'scripts/main.jsx'
    }).aspect({
        aspect: file => (file.content = 'process={env:{NODE_ENV: \'production\'}};\n' + file.content)
    }).uglify().stamp().integrity().aspect({
        aspect: file => {
            scriptIntegrity = file.integrity;
            RES_MAP.set(file.filename, path.join(path.dirname(file.filename), file.stamp));
        }
    }).write(WRITE_ORIGIN);

    // HTML
    panto.$('index.html').tag('index.html').read().resource({
        getResourceAlias: name => RES_MAP.get(name)
    }).replace({
        replacements: [
            ['<!-- scripts -->', function () {
                return `<script src="./${RES_MAP.get('scripts/bundle.js')}" integrity="${scriptIntegrity}"></script>`;
            }],
            ['<!-- styles -->', function () {
                return `<link rel="stylesheet" href="./${RES_MAP.get('styles/main.less')}" integrity="${styleIntegrity}"/>`;
            }]
        ]
    }).write();
    panto.reportDependencies('index.html', '**/*.{less,css}', '**/*.{jsx,js}');
};