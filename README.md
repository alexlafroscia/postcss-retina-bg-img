# [postcss][postcss]-retina-bg-img

[![Build Status](https://travis-ci.org/alexlafroscia/postcss-retina-bg-img.svg?branch=master)][ci]
[![npm version](https://badge.fury.io/js/postcss-retina-bg-img.svg)](https://badge.fury.io/js/postcss-retina-bg-img)

> Automatically add retina background images to CSS selectors

## Install

With [npm](https://npmjs.org/package/postcss-retina-bg-img) do:

```
npm install postcss-retina-bg-img --save
```

## What does it do?

The idea of this plugin is to detect any background images in your CSS and, if a retina version of the same file is found, to automatically add that file within a retina-appropriate media query.

### Input

```css
.foo {
  background: url('/assets/images/foo.png');
}

.bar {
  background-image: url('/assets/images/bar.png');
}
```

### Output

```css
.foo {
  background: url('/assets/images/foo.png');
}

@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .foo {
    background-image: url('/assets/images/foo@2x.png');
  }
}

.bar {
  background-image: url('/assets/images/bar.png');
}

@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .bar {
    background-image: url('/assets/images/bar@2x.png');
  }
}
```

## API

```javascript
const postcss = require('postcss');
const retinaBgImage = require('postcss-retina-bg-img');

const options = {
  retinaSuffix: '...',
  mediaQuery: '...',
  assetDirectory: '...',
  includeFileExtensions: [ '...' ]
};

return postcss([ retinaBgImage(options) ]).process(input);
```

#### options

##### retinaSuffix *(optional)*

Type: `string || string[]`
Default: `@2x`

The possible retina suffixes to find a retina image with.  For example, if the background image is `foo.png`, and you've specified `@2x` as the `retinaSuffix`, then the file `foo@2x.png` would be used as the retina version.  Note that the retina media query is _only_ added if the file actually exists; if you don't have a `foo@2x.png` then this plugin won't change a thing.

If an array of suffixes is provided, then any of the given strings will be matched against.  If you have a situation where multiple files could satisfy the settings, such as `retinaSuffix: ['@2x', '_2x']` with the following files:

```txt
foo.png
foo@2x.png
foo_2x.png
```

Then the first one in the `retinaSuffix` array will be used.

##### mediaQuery *(optional)*

Type: `string`
Default: `(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)`

The media query to use to target retina displays.  The default should be sufficient, but if you need something custom, feel free to provide your own.

##### assetDirectory *(required)*

Type: `string`

The path to your asset directory.  This should be the location on the filesystem that your files are served from.

For example, if your CSS links to an image like so:

```css
.foo {
  background-image: url('/assets/images/foo.png');
}
```

then the `assetDirectory` should be the *absolute path on the filesystem* to wherever `assets` lives.  This is necessary because this plugin will only add media queries for files that actually exist; to determine their existence, we must be able to actually find the file.

##### includeFileExtensions *(optional)*

Type: `string[]`
Default `['png', 'jpg']`

The file extensions to act on. Without a whitelist of file types, you'll end up checking for retina versions of `svg` files and the like, which you may not actually want to act on.  If you need to check anything other than `png` or `jpg` files, simply define an array of file extensions here.

## Usage

See the [PostCSS documentation](https://github.com/postcss/postcss#usage) for examples for your environment.

## Gotchas

A few things to note when using this plugin:

- Media queries are only added if the retina version of the file is found.  Make sure your retina images follow some kind of pattern so that they can be located based on the name of the non-retina file.
- Selectors with a background image that are inside a media query already will create a new, combined media query to target both the existing one and retina displays.  For example, the following should happen:

    ```css
    /* Input */
    .foo {
      background: url('/assets/images/foo-mobile.png');
    }

    @media (min-width: 600px) {
      .foo {
        background: url('/assets/images/foo.png');
      }
    }
    ```

    ```css
    /* Output */
    .foo {
      background: url('/assets/images/foo-mobile.png');
    }

    @media (min-width: 600px) {
      .foo {
        background: url('/assets/images/foo.png');
      }
    }

    @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
      .foo {
        background-image: url('/assets/images/foo-mobile@2x.png');
      }
    }

    @media (-webkit-min-device-pixel-ratio: 2) and (min-width: 600px), (min-resolution: 192dpi) and (min-width: 600px) {
      .foo {
        background-image: url('/assets/images/foo@2x.png');
      }
    }
    ```

    If this does not seem to be working correctly, please [file a ticket][issues] so I can make the rule combination more robust.


## Contributing

Pull requests are welcome. If you add functionality, then please add unit tests to cover it.

## License

MIT © [Alex LaFroscia](https://github.com/alexlafroscia/postcss-retina-bg-img)

[ci]:       https://travis-ci.org/alexlafroscia/postcss-retina-bg-img
[coverage]: https://coveralls.io/github/alexlafroscia/postcss-retina-bg-img?branch=master
[issues]:   https://github.com/alexlafroscia/postcss-retina-bg-img/issues
[postcss]:  https://github.com/postcss/postcss
