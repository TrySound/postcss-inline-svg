# Changelog

## 2.0.0

* Code and tests refactoring
* `encode` is not included in `transform` and runs before it
* `encode` is `function` or `false`
* `transform` can't return false
* Fix bug with quotes [#19](https://github.com/TrySound/postcss-inline-svg/issues/19)

## 1.4.0

* Support "=" separator in svg-load() definition

## 1.3.2

* Fix URI malformed error

## 1.3.1

* Add read-cache

## 1.3.0

* Refactoring
* Loaded files will be cached

## 1.2.1

* Fix relative path detecting

## 1.2.0

* Add transform option

## 1.1.1

* Improve documentation

## 1.1.0

* Fix ie strict data uri by adding custom url encode
* Add encode option

## 1.0.0

* Initial release
