# PostCSS Inline Svg [![Build Status][ci-img]][ci]

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
    background: url('data:image/svg+xml,charset=utf-8,<svg fill="#cfc"><path d="..."/><path d="..." fill="#ff0"/><path d="..."/></svg>');
}
.up {
    background: url('data:image/svg+xml,charset=utf-8,<svg fill="#000" stroke="#fff">...</svg>');
}
```

## Usage

```js
postcss([ require('postcss-inline-svg') ])
```

See [PostCSS] docs for examples for your environment.
