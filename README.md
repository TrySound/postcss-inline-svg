# PostCSS Inline SVG [![Build Status][ci-img]][ci]

[PostCSS] plugin to inline svg.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/TrySound/postcss-inline-svg.svg
[ci]:      https://travis-ci.org/TrySound/postcss-inline-svg

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
    background: svg-load(img/arrow-up.svg, fill: #000, stroke: #fff);
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

## Usage

```js
postcss([ require('postcss-inline-svg')(options) ])
```

See [PostCSS] docs for examples for your environment.

### Options

#### options.encode

Enable light url encode which replaces `<`, `>`, `&`, `#`

Default: true

#### options.path

Path which will resolve url

Default: `false` - path will be relative to source file if it was specified
