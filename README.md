# [postcss][postcss]-retina-bg-img

[![Build Status](https://travis-ci.org/alexlafroscia/postcss-retina-bg-img.svg?branch=master)](https://travis-ci.org/alexlafroscia/postcss-retina-bg-img)

> Automatically add retina background images

## Install

With [npm](https://npmjs.org/package/postcss-retina-bg-img) do:

```
npm install postcss-retina-bg-img --save
```

## Example

### Input

```css
h1 {
    color: red;
}
```

### Output

```css
h1{color:red}
```

## API

### retinaBgImg([options])

#### options

##### foo

Type: `boolean`
Default: `true`

Description of what it does. An example:

```js
var css = 'h1 { color: red }';
console.log(postcss([ require('postcss-retina-bg-img')({foo: true}) ]).process(css).css);

// => 'h1{color:red}'
```

## Usage

See the [PostCSS documentation](https://github.com/postcss/postcss#usage) for
examples for your environment.

## Contributing

Pull requests are welcome. If you add functionality, then please add unit tests
to cover it.

## License

MIT © [Alex LaFroscia](https://github.com/alexlafroscia/postcss-retina-bg-img)

[ci]:      https://travis-ci.org/alexlafroscia/postcss-retina-bg-img
[deps]:    https://gemnasium.com/alexlafroscia/postcss-retina-bg-img
[npm]:     http://badge.fury.io/js/postcss-retina-bg-img
[postcss]: https://github.com/postcss/postcss
