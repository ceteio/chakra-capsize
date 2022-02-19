# @ceteio/chakra-capsize

## 1.2.0

### Minor Changes

- 350ff0f: Forward refs to the underlaying DOM nodes

### Patch Changes

- c1c94ae: Fix example font loading on codesandbox

## 1.1.0

### Minor Changes

- e590a56: Added an example project in `example/`

## 1.0.1

### Patch Changes

- ab7722e: Add repo URL to package.json for npm
- 598f34c: Correctly import React

## 1.0.0

### Major Changes

- 9a16269: Initial release

  ```
  yarn add @ceteio/chakra-capsize
  ```

  **Usage**

  ```javascript
  import { withCappedText } from "@ceteio/chakra-capsize/theme";
  import { CappedText, CappedHeading } from "@ceteio/chakra-capsize";
  import { ChakraProvider, extendTheme } from "@chakra-ui/react";
  import robotoFontMetrics from "@capsizecss/metrics/roboto";

  const theme = extendTheme(
    defaultTheme,
    {
      fonts: {
        heading: "Roboto",
        body: "Roboto"
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
          <CappedHeading as="h1" size="2xl">
            Hi!
          </CappedHeading>
          <CappedText>
            This paragraph will have surrounding whitespace trimmed. It will
            also have space between the lines of text reduced to 0.
          </CappedText>
          <CappedText capHeight="lg" lineGap={4}>
            Setting a capHeight overrides any fontSize prop for more exact
            sizing. Meanwhile, a lineGap uses the Chakra 'spacings' scale to
            insert space between lines of text just like any other Chakra
            element.
          </CappedText>
        </div>
      </ChakraProvider>
    );
  };
  ```
