<div align="center">
  <img width="500" src="./img/logo.png" alt="chakra + capsize">
  <br>
  <br>
  <br>
  <p>
    The power of <a href="https://seek-oss.github.io/capsize/">Capsize</a> inside <a href="https://chakra-ui.com/">Chakra UI</a>
  </p>
  <p>
    <sup>
      <a href="https://githubbox.com/ceteio/chakra-capsize/tree/main/example" target="_blank">Try it on Codesandbox</a>
    </sup>
  </p>
    <br>
  <br>
  <br>
</div>

```
yarn add @ceteio/chakra-capsize
```

**Usage**

```javascript
import { withCappedText } from '@ceteio/chakra-capsize/theme'
import { CappedText, CappedHeading } from '@ceteio/chakra-capsize'
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import robotoFontMetrics from '@capsizecss/metrics/roboto';

const theme = extendTheme(
  defaultTheme,
  {
    fonts: {
      heading: 'Roboto',
      body: 'Roboto',
    },
    capHeights: {
      sm: 10,
      md: 14,
      lg: 18,
      xl: 24
    }
  },
  withCappedText({
    fontMetrics: {
      Roboto: robotoFontMetrics
    }
  })
);

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <div>
        <CappedHeading as="h1" size="2xl">Hi!</CappedHeading>
        <CappedText>
          This paragraph will have surrounding whitespace
          trimmed. It will also have space between the lines
          of text reduced to 0.
        </CappedText>
        <CappedText capHeight="lg" lineGap={4}>
          Setting a capHeight overrides any fontSize prop for
          more exact sizing.  Meanwhile, a lineGap uses the
          Chakra 'spacings' scale to insert space between
          lines of text just like any other Chakra element.
        </CappedText>
      </div>
    </ChakraProvider>
  );
}
```

## Theming

Setting up your theme requires the following:

- A defined body & heading font
- Font metrics for each defined font
- Text size theme keys
- Extending the theme with `withCappedText`

### Body & Heading font

[Capsize recommends using non-system / non-fallback
fonts](https://seek-oss.github.io/capsize/) to get the best results & most
accurate trimming.

Specying fonts can be done in the following ways;

1. Using [chakra's fonts theme
   key](https://chakra-ui.com/docs/theming/theme#typography) _(default)_
   - `chakra-capsize` will use the theme's `fonts.body` &
     `fonts.heading` theme values for `<CappedText>` & `<CappedHeading>`
     respectively unless a more specific font family is passed in.
1. Setting `fontFamily` on `components.Text` / `components.Heading`.
   - This is particularly useful when you have variants that use different font
     faces such as pull quotes or buttons.
1. Passing `fontFamily` directly to a `<CappedText>` / `<CappedHeading>`.
   - The `fontFamily` prop passed will override any value on `Components.Text` /
     `components.Heading` or the fonts theme key.

### Font metrics for each defined font

Once your component has a font, `chakra-capsize` requires the corresponding font
metrics to be available for calculating the correct trim values.

Importantly, the key used when passing metrics to the
`withCappedText##fontMetrics` option must exactly match the font family name.

For example, when using the `Open Sans` font, you must set it up like so:

```javascript
withCappedText({
  fontMetrics: {
    'Open Sans': { ... }
  }
})

// ...

<CappedText fontFamily="Open Sans">...
```

### Text size theme keys

`chakra-capsize` has two primary configuration methods, mapping to the
underlaying implementation of `capsize`:

1. Text size
1. Space between lines of text

#### Text size

`chakra-capsize` allows defining the Text size as either a `fontSize` value, or
a `capHeight` value, where `capHeight` will override `fontSize` if set.

By default, `chakra-capsize` will use `fontSize` as it's the easiest to get
started with, and often more closely matches measurements from design tools such
as Figma & Sketch.

When you're ready to have more accurate control over the exact size of text, you
can use the `capHeight` prop by setting the `capHeights` key in your Chakra
theme:

```javascript
const theme = {
  capHeights: {
    sm: 10,
    md: 12,
    lg: 14
    // ...
  }
}
```

Then the corresponding values can be passed either directly to a `<CappedText>`
/ `<CappedHeading>` component:

```javascript
<CappedText capHeight="lg">...
```

or on variants, etc, in your component theme:

```javascript
const theme = {
  components: {
    Text: {
      variants: {
        huge: {
          capHeight: '2xl'
        }
      }
    }
  }
}
```

#### Space between lines

When multiple lines of text are displayed, a default gap of `0px` is applied,
resulting in lines of text whos capital letters press up againt each other.

This gap can be configured in multiple ways, two of which (`lineGap` &
`leading`) are closely related while the third (`lineHeight`) is available to
support values supplied in Chakra's default theme.

`lineGap` is the number of pixels between the bottom of one capital letter and
the top of a capital letter on the next line. `lineGap` uses the `spacings`
theme key.

`leading` can be thought of as `lineGap + capHeight`. Or, to put it another way;
the distance from the bottom of one capital letter to the bottom of a capital
letter on the next line. `leading` uses the `sizes` theme key.

`lineHeight` will set the value directly onto the text, however it's important
to note that it will _not_ affect the spacing at the top/bottom of the text
element (it will remain trimmed).

As with `capHeight`, `lineGap` & `leading` can be specified on the component
directly:

```javascript
<CappedText lineGap={6}>...
```

or on variants, etc, in your component theme:

```javascript
const theme = {
  components: {
    Text: {
      variants: {
        huge: {
          lineGap: 12
        }
      }
    }
  }
}
```

## `<CappedText>` & `<CappedHeading>`

Extending Chakra's [`<Text>`](https://chakra-ui.com/docs/typography/text) and
[`<Heading>`](https://chakra-ui.com/docs/typography/heading) components,
`<CappedText>` / `<CappedHeading>` uses `capsize` to trim space surrounding and
between lines of text.

Note when using `isTruncated` or `noOfLines` props: To avoid ascenders and
descenders from being cut off (due to `overflow: hidden`), an extra `<span>`
element is inserted inside the element when either `isTruncated` or `noOfLines`
is set.

### Props

All of `<Text>` / `<Heading>`'s props are fully supported. In addition,
the following props are available:

A note on responsive values: Each of the following props fully support
responsive formats (both array and object) with one restriction: a `base` size
_must_ be set, otherwise an error is thrown.

#### `capHeight`

Specifies the height, in pixels, of a capital letter in the line of text.
Internally, `chakra-capsize` trims surrounding whitespace via capsize which
makes `capHeight` equivalent to setting `min-height` on a `<div>`.

Can be a number, or one of the `capHeights` theme key (which resolves to a
number).

When set, `capHeight` will override any `fontSize` values set.

#### `lineGap`

Default: `0`.

When multiple lines of text are displayed, `lineGap` specifies the gap, in
pixels, between those lines.

`lineGap` uses the `spacings` theme scale.

When set, `lineGap` will override any `leading` or `lineHeight` values set.

#### `leading`

When multiple lines of text are displayed, `leading` specifies the distance
between one baseline to the next.

`leading` uses the `sizes` theme scale.

#### `sx`

Using the `sx` prop is fully supported, however behaviour is undefined when
attempting to set any of `fontSize`, `lineHeight`, `::before`, or `:;after`. It
is recommended to only set `fontSize` and `lineHeight` via props, and avoid
setting `::before` or `::after` at all.

## `withCappedText(options)`

```
import { withCappedText } from '@ceteio/chakra-capsize/theme'
```

Add support for capsize to your Chakra theme via `withCappedText`. It must be
passed in as an argument to Chakra's `extendTheme` to correctly extend the the
values required.

### `options.fontMetrics`

[Capsize](https://seek-oss.github.io/capsize/) requires a set of known font
metrics to correctly trim whitespace from around and between lines of text.

`chakra-capsize` also uses font metrics to support theming with Chakra.

The easiest way to generate font metrics is with the
[`@capsizecss/metrics`](https://github.com/seek-oss/capsize/tree/master/packages/metrics)
package:

```javascript
import robotoFontMetrics from '@capsizecss/metrics/roboto';
// ...
extendTheme(
  withCappedText({
    fontMetrics: {
      Roboto: robotoFontMetrics
    }
  })
);
```

_(See the [capsize docs](https://github.com/seek-oss/capsize#font-metrics) for
more ways of obtaining the necessary font metrics.)_

### `options.defaultFontSize`

_Default: `'md'`_

For `chakra-capsize` to work correctly out of the box, a default font size must
be set for all `<Text>` / `<CappedText>` / `<Heading>` / `<CappedHeading>`
components. The `defaultFontSize` option will use the `fontSizes` theme scale.

### `options.htmlFontSize`

_Default: `16`_

To safely convert between `rem` & `px` font sizes needed by Capsize,
`chakra-capsize` must know what the html font size is. All modern browsers set
this default to `16px`, and `chakra-capsize` does too.

You should only ever need to set this if you explicitly change the `font-size`
of the `html` element.

## Frequently Asked Questions

### Why are descenders cut off when using `isTruncated` or `noOfLines`?

To fix it, add a `lineGap` that is at least the height of the descenders.

This occurs due to `chakra-capsize`s default of `lineGap = 0` which instructs
capsize to set the container to be the same height as a capital letter. Then
when `isTruncated` sets `overflow: hidden`, the ascenders & descenders are cut
off. By setting a `lineGap` (or `leading` or `lineHeight`), the height of the
container is increased to stop the cut off while maintaining the correct
