# PostCSS Inline Svg [![Build Status][ci-img]][ci]

[PostCSS] plugin to inline svg.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/TrySound/postcss-inline-svg.svg
[ci]:      https://travis-ci.org/TrySound/postcss-inline-svg

```css
@svg-load nav url(img/nav.svg) {
    fill: #cfc;
    color: #000;
    path:nth-child(2) {
        fill: currentColor;
    }
}
.nav {
    background: svg-inline(nav);
}
.up {
    background: svg-load(img/arrow-up.svg);
}
```

```css
.nav {
    background: url(data:image/svg+xml,charset=utf-8,...);
}
.up {
    background: svg-load(data:image/svg+xml,charset=utf-8,...);
}
```

## Usage

```js
postcss([ require('postcss-inline-svg') ])
```

See [PostCSS] docs for examples for your environment.
