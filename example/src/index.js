import { StrictMode } from "react";
import ReactDOM from "react-dom";

import { withCappedText } from '@ceteio/chakra-capsize/theme'
import { CappedText, CappedHeading } from '@ceteio/chakra-capsize'
import { Stack, ChakraProvider, extendTheme } from "@chakra-ui/react";

// Grab metrics about the Roboto font face
import robotoFontMetrics from '@capsizecss/metrics/roboto';

// Sets up our Roboto font file
import "@fontsource/roboto";

const theme = extendTheme(
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
      <Stack spacing={12} sx={{ margin: '20px auto', maxWidth: '2xl' }}>
        <CappedHeading as="h1" size="xl">
          @ceteio/chakra-capsize Example
        </CappedHeading>
        <CappedText capHeight="xl">
          This paragraph will have surrounding whitespace
          trimmed. It will also have space between the lines
          of text reduced to 0.
        </CappedText>
        <CappedText lineGap={4}>
          Setting a capHeight overrides any fontSize prop for
          more exact sizing.  Meanwhile, a lineGap uses the
          Chakra 'spacings' scale to insert space between
          lines of text just like any other Chakra element.
        </CappedText>
        <CappedText capHeight="lg" lineGap={6}>
          Try setting the Stack's spacing to 0, and play with
          the lineGap + capHeight of each &lt;CappedHeading&gt;
          &amp; &lt;CappedText&gt; to get a feel for how things
          fit together.
        </CappedText>
      </Stack>
    </ChakraProvider>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  rootElement
);
