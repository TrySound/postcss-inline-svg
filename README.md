# postcss-inline-svg [![Build Status][travis-img]][travis]

[PostCSS] plugin to reference an SVG file and control its attributes with CSS syntax.

[PostCSS]: https://github.com/postcss/postcss
[travis-img]: https://travis-ci.org/TrySound/postcss-inline-svg.svg
[travis]: https://travis-ci.org/TrySound/postcss-inline-svg

```css
@svg-load nav url(img/nav.svg) {
    fill: #cfc;
    path:nth-child(2) {
        fill: #ff0;
    }
}
.nav {
    background: svg-inline(nav);
}
.up {
    background: svg-load('img/arrow-up.svg', fill=#000, stroke=#fff);
}
```

```css
.nav {
    background: url("data:image/svg+xml;charset=utf-8,%3Csvg fill='%23cfc'%3E%3Cpath d='...'/%3E%3Cpath d='...' fill='%23ff0'/%3E%3Cpath d='...'/%3E%3C/svg%3E");
}
.up {
    background: url("data:image/svg+xml;charset=utf-8,%3Csvg fill='%23000' stroke='%23fff'%3E...%3C/svg%3E");
}
```

PostCSS parsers allow to use different syntax (but only one syntax in one svg-load() definition):

```css
.up {
    background: svg-load('img/arrow-up.svg', fill: #000, stroke: #fff);
}
.down {
    background: svg-load('img/arrow-down.svg', fill=#000, stroke=#fff);
}
```

## Usage

```js
postcss([ require('postcss-inline-svg')(options) ])
```

See [PostCSS] docs for examples for your environment.

### Options

#### options.path

Path which will resolve url.

Default: `false` - path will be relative to source file if it was specified.

#### options.encode(svg)

Processes svg after applying parameters. Default will be ommited if passed `false`.

Default:

```js
function encode(code) {
    return code
        .replace(/%/g, '%25')
        .replace(/</g, '%3C')
        .replace(/>/g, '%3E')
        .replace(/&/g, '%26')
        .replace(/#/g, '%23');
}
```

#### options.transform(svg, path)

Transforms svg after `encode` function and generates url.


## Optimisation

Add [postcss-svgo](https://github.com/ben-eb/postcss-svgo)
or [cssnano](https://github.com/ben-eb/cssnano)
(includes postcss-svgo) in your plugin list to minify svg images automatically.

```js
postcss([
    require('postcss-inline-svg'),
    require('postcss-svgo')
])
```


# License

MIT © [Bogdan Chadkin](mailto:trysound@yandex.ru)
