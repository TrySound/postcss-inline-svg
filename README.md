# PostCSS Inline SVG [![Build Status][travis-img]][travis]

[PostCSS] plugin to reference an SVG file and control its attributes with CSS syntax.

[PostCSS]: https://github.com/postcss/postcss
[travis-img]:  https://travis-ci.org/TrySound/postcss-inline-svg.svg
[travis]:      https://travis-ci.org/TrySound/postcss-inline-svg

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
    background: svg-load(img/arrow-up.svg, fill=#000, stroke=#fff);
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
    background: svg-load(img/arrow-up.svg, fill: #000, stroke: #fff);
}
.down {
    background: svg-load(img/arrow-down.svg, fill=#000, stroke=#fff);
}
```

## Usage

```js
postcss([ require('postcss-inline-svg')(options) ])
```

See [PostCSS] docs for examples for your environment.

### Options

#### options.path

Path which will resolve url

Default: `false` - path will be relative to source file if it was specified

#### options.encode

Enable light url encode which replaces `<`, `>`, `&`, `#`

Default: true

#### options.transform(data, path, opts)

Function which transforms svg content as you like. If result is falsy will be used default transform. Result should includes data:uri prefix and quotes.

> options.encode affects only default transform


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
