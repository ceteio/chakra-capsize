import { FontMetrics } from "@capsizecss/core";
import { ThemeOverride, TypographyProps } from "@chakra-ui/react";

export type CappedTextThemeExtension = {
  fontMetrtics: Record<string, FontMetrics>;
  htmlFontSize: number;
};

export type WithCappedTextConfig = {
  defaultFontSize?: TypographyProps["fontSize"];
  htmlFontSize?: number;
  fontMetrics: Record<string, FontMetrics>;
};

export const withCappedText = ({
  defaultFontSize = "md",
  htmlFontSize = 16,
  fontMetrics,
}: WithCappedTextConfig): ThemeOverride<CappedTextThemeExtension> => ({
  cappedText: {
    fontMetrics,
    htmlFontSize,
  },
  components: {
    Text: {
      defaultProps: {
        fontSize: defaultFontSize,
      },
    },
    Heading: {
      defaultProps: {
        fontSize: defaultFontSize,
      },
    },
  },
});
