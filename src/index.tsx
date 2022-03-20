import React, { ComponentType, ForwardedRef, Ref } from "react";
import {
  Box,
  Text,
  Heading,
  useTheme,
  useToken,
  useStyleConfig,
  TextProps,
  HeadingProps,
  ResponsiveValue,
  ThemeTypings,
  As,
  forwardRef,
  CSSObject,
  SystemStyleObject
} from "@chakra-ui/react";
import omit from "lodash/omit";

import { useCappedText } from "./utils";

type CappedElProps = {
  Tag: ComponentType<{
    styleConfig: CSSObject;
    sx: SystemStyleObject;
    ref: ForwardedRef<any>;
  }>;
  elName: "Heading" | "Text";
  fontFamilyType: ThemeTypings["fonts"];
} & CappedProps;

const CappedEl = forwardRef<CappedElProps, As>(
  ({ elName, Tag, fontFamilyType, truncatedRef, ...props }, ref) => {
    const { isTruncated, noOfLines, children } = props;
    const styleConfig = useStyleConfig(elName, props);
    const globalFontFamily = useToken("fonts", fontFamilyType);
    const defaultProps = useTheme().components[elName]?.defaultProps;
    const defaultFontFamily = defaultProps?.fontFamily ?? globalFontFamily;
    const cappedStyles = useCappedText({
      ...defaultProps,
      fontFamily: defaultFontFamily,
      ...styleConfig,
      ...props,
    });

    const passthroughProps = omit(props, [
      "isTruncated",
      "noOfLines",
      "capHeight",
      "lineGap",
      "leading",
      "fontSize",
      "lineHeight",
    ]);

    return (
      <Tag
        ref={ref}
        {...passthroughProps}
        // Stop Chakra from looking up styles in the theme.components.Text object
        // since we've already done that above.
        // This allows us to pass custom styles while still leveraging the props
        // the <Text> component would normally accept.
        styleConfig={{}}
        // The theme styels first, then `sx` prop, then calculated cappedStyles
        sx={{ ...styleConfig, ...props.sx, ...cappedStyles }}
      >
        {isTruncated || noOfLines ? (
          // The inner <span> is necessary to avoid accidentally cutting off
          // ascenders / descenders when overflow: hidden is applied. In this way,
          // the correct capsize values are applied to the wrapping element which
          // is inherited by the <span>, but the overflow values are only applied
          // to the inner <span>.
          <Box
            ref={truncatedRef}
            as="span"
            {...{ isTruncated, noOfLines }}
            sx={isTruncated ? { display: "block" } : {}}
          >
            {children}
          </Box>
        ) : (
          children
        )}
      </Tag>
    );
  }
);

export type CappedProps = {
  capHeight?: ResponsiveValue<
    ThemeTypings extends { capHeights: any }
      ? ThemeTypings["capHeights"] | number | (string & {})
      : number | (string & {})
  >;
  lineGap?: ResponsiveValue<ThemeTypings["space"] | number | (string & {})>;
  leading?: ResponsiveValue<ThemeTypings["sizes"] | number | (string & {})>;
  truncatedRef?: Ref<HTMLDivElement>;
};

export type CappedTextProps = TextProps & CappedProps;

export const CappedText = forwardRef<CappedTextProps, "p">((props, ref) => (
  <CappedEl
    ref={ref}
    {...props}
    Tag={Text}
    elName="Text"
    fontFamilyType="body"
  />
));

export type CappedHeadingProps = HeadingProps & CappedProps;

export const CappedHeading = forwardRef<CappedHeadingProps, "h2">(
  (props, ref) => (
    <CappedEl
      ref={ref}
      {...props}
      Tag={Heading}
      elName="Heading"
      fontFamilyType="heading"
    />
  )
);
