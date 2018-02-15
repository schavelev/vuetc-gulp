# vuetc-gulp
[![Build Status](https://travis-ci.org/schavelev/vuetc-gulp.svg?branch=master)](https://travis-ci.org/schavelev/vuetc-gulp)

VueTC - Vue templates compiler. Gulp-plugin for compiling and bundling VueJS templates into a single associated array of render functions.

## Installation

Install package with NPM and add it to your development dependencies:

`npm install --save-dev vuetc-gulp`

## Usage
### Bandle generation
```js
var concat = require('vuetc-gulp');

gulp.task('vuetc', function() {
  return gulp.src('./src/**/*.vue.html')
    .pipe(concat('vue-templates.js'))
    .pipe(gulp.dest('./wwwroot/dist/'));
});
```
This will collect the template files and passes them through the vue-template-compiler.
The compiled render functions will be saved to the js-file as an associated array.
```js
var RenderedTemplate = {
    'app-grid-template': {
        'render': function () {
            with (this) { return _c('div', ...) }
        },
        'staticRenderFns': []
    },
    'demo-grid-template': {
        'render': function () {
            with (this) { return _c('table', ...) }
        },
        'staticRenderFns': []
    }
};
```
### Templates provider
Create a helper in your project.
```ts
// TemplateProvider.ts
declare const RenderedTemplate: any;

declare type TemplateProviderResult = {
    template?: string;
    render?: any;
    staticRenderFns?: Array<any>;
}

export default class TemplateProvider {
    static getTemplate(templ: string): TemplateProviderResult {
        if (templ && templ.charAt(0) === '#' && RenderedTemplate) {
            var res = RenderedTemplate[templ.substring(1)] as TemplateProviderResult;
            if (res)
                return res;
        }
        return { template: templ };
    }
}
```
### Get compiled render function
Vue component can use compiled render functions from vuetc-gulp result.
```ts
// DemoGrid.ts
import Vue from 'vue';
import TemplateProvider from '../helpers/TemplateProvider';

export default Vue.extend({
    //template: '#demo-grid-template',
    ...TemplateProvider.getTemplate('#demo-grid-template'),
    props: ['rows', 'columns', 'filterKey'],
    data: function () {}
});
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2018, Eduard Schavelev