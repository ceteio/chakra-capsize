import { useTheme } from "@chakra-ui/react";
import { createStyleObject } from "@capsizecss/core";
import memoizeOne from "memoize-one";
import deepEqual from "lodash/isEqual";
import pickBy from "lodash/pickBy";

// From https://github.com/chakra-ui/chakra-ui/blob/684012d868516412e91eb390379ccf7698536345/packages/utils/src/breakpoint.ts#L6
function analyzeCSSValue(value) {
  const num = parseFloat(value.toString());
  const unit = value.toString().replace(String(num), "");
  return { unitless: !unit, value: num, unit };
}

const capHeightToFontSize = ({ capHeight, fontMetrics }) =>
  capHeight / (fontMetrics.capHeight / fontMetrics.unitsPerEm);

const getBreakpointKeysArray = memoizeOne(theme =>
  Array.from(theme.__breakpoints.keys.values())
);

const getResponsiveValue = ({ theme, breakpoint, value }) => {
  const breakpointKeys = getBreakpointKeysArray(theme);

  for (let i = breakpointKeys.indexOf(breakpoint); i >= 0; i--) {
    if (
      // If there's a value set for the given breakpoint
      typeof value[breakpointKeys[i]] !== "undefined" &&
      // And that value isn't explicitly 'null'
      value[breakpointKeys[i]] !== null
    ) {
      // We've found our value
      return value[breakpointKeys[i]];
    }
  }
};

const detokenize = ({ theme, key, breakpoint, value }) => {
  if (value == null) {
    return undefined;
  }
  const concreteValue = getResponsiveValue({ theme, breakpoint, value });
  return concreteValue == null
    ? undefined
    : theme[key]?.[concreteValue] ?? concreteValue;
};

const responsivify = (theme, value) => {
  if (Array.isArray(value)) {
    return theme.__breakpoints.toObjectValue(value);
  }

  if (typeof value === "object" && theme.__breakpoints.isResponsive(value)) {
    return value;
  }

  if (value == null) {
    return undefined;
  }

  return { base: value };
};

const convertCssToPxValue = ({ theme, value, propName, breakpoint }) => {
  const valueMeta = analyzeCSSValue(value);
  let result;

  switch (valueMeta.unit) {
    case "rem":
      // Convert to a pixel-based size
      result = valueMeta.value * (theme.cappedText?.htmlFontSize ?? 16);
      break;
    case "px":
    case "":
      result = valueMeta.value;
      break;
    default:
      throw Error(
        `Unable to handle ${propName} value. Got ${JSON.stringify(
          value
        )}. Expected px or rem value.`
      );
  }

  return result;
};

const convertCssToLineheightValue = ({ capSizeConfig, fontMetrics }) => ({
  theme,
  value,
  propName,
  breakpoint
}) => {
  const valueMeta = analyzeCSSValue(value);
  let result;

  // A raw number or unitless string is a fontSize multiplier
  if (valueMeta.unitless) {
    if (capSizeConfig[breakpoint].capHeight) {
      // calculate the fontSize from the capHeight
      result =
        valueMeta.value *
        capHeightToFontSize({
          capHeight: capSizeConfig[breakpoint].capHeight,
          fontMetrics: fontMetrics[breakpoint]
        });
    } else {
      result = valueMeta.value * capSizeConfig[breakpoint].fontSize;
    }
  } else if (valueMeta.unit === "rem") {
    // A unit-ed number is assumed to be a rem value
    result = valueMeta.value * (theme.cappedText?.htmlFontSize ?? 16);
  } else {
    throw Error(
      `Unable to handle ${propName} value. Got ${JSON.stringify(
        value
      )}. Expected rem or unitless value.`
    );
  }

  return result;
};

const calculateResponsiveValues = ({
  theme,
  props,
  propName,
  themeKey,
  cssConverter = convertCssToPxValue
}) => {
  const responsiveValue = responsivify(theme, props[propName]);
  if (responsiveValue?.base == null) {
    throw new Error(
      `${propName} must specify a 'base' value when used responsively. Got ${JSON.stringify(
        props[propName]
      )}`
    );
  }

  let result = {};

  for (let breakpoint of Object.keys(responsiveValue)) {
    const concreteValue = detokenize({
      theme,
      key: themeKey,
      breakpoint,
      value: responsiveValue
    });

    result[breakpoint] = cssConverter({
      theme,
      value: concreteValue,
      propName,
      breakpoint
    });
  }

  return result;
};

const simplifyResponsiveValues = ({ theme, value, collapseBase = false }) => {
  // Convert to object syntax if not already
  const responsiveValue = responsivify(theme, value);

  const breakpointKeys = getBreakpointKeysArray(theme);
  let lastValueSet = responsiveValue[breakpointKeys[0]];
  let result = {
    [breakpointKeys[0]]: lastValueSet
  };

  for (let i = 1; i < breakpointKeys.length; i++) {
    // Skip breakpoints that aren't set
    if (typeof responsiveValue[breakpointKeys[i]] === "undefined") {
      continue;
    }
    const valueForBreakpoint = responsiveValue[breakpointKeys[i]];
    if (
      // Skip 'null' values (but not 'undefined')
      valueForBreakpoint !== null &&
      // We've hit a new value
      !deepEqual(valueForBreakpoint, lastValueSet)
    ) {
      lastValueSet = valueForBreakpoint;
      result[breakpointKeys[i]] = lastValueSet;
    }
  }

  if (
    collapseBase &&
    // When there's only a single item
    Object.keys(result).length === 1 &&
    // And that item is the 'base'
    typeof result[breakpointKeys[0]] !== "undefined"
  ) {
    // Just return that raw item on its own
    return result[breakpointKeys[0]];
  }

  return result;
};

export const useCappedText = props => {
  const theme = useTheme();
  const { __breakpoints } = theme;

  let fontMetrics = {};
  let capSizeConfig = {};

  // ------------------
  // Font Family
  //
  // Parsing the `fontFamily` prop to figure out fontMetrics required by capSize
  // and our own calculations.
  // ------------------
  for (let breakpoint of __breakpoints.keys) {
    const responsiveFontFamily = responsivify(theme, props.fontFamily);
    const fontFamilyForBreakpoint = detokenize({
      theme,
      key: "fonts",
      breakpoint,
      value: responsiveFontFamily
    });

    // Determine the font family in use by splitting the css string
    // TODO: How do we handle comments, newlines, etc?
    const fontFamilies = fontFamilyForBreakpoint
      .split(",")
      .map(family => family.trim())
      .filter(Boolean);

    // Try to find the first font family we've got metrics for
    const fontFamily = fontFamilies.find(
      family => !!theme.cappedText.fontMetrics[family]
    );

    if (!fontFamily) {
      throw new Error(
        `Unable to determine font metrics for the given family: "${props.fontFamily}". Ensure the theme.cappedText.fontMetrics object is setup and the keys match the font families`
      );
    }

    fontMetrics[breakpoint] = theme.cappedText.fontMetrics[fontFamily];
  }

  // Initialise the config needed to pass to capSize for each breakpoint
  for (let breakpoint of __breakpoints.keys) {
    capSizeConfig[breakpoint] = {
      fontMetrics: fontMetrics[breakpoint]
    };
  }

  const useCapHeight = typeof props.capHeight !== "undefined";
  const useFontSize = !useCapHeight && typeof props.fontSize !== "undefined";

  const useLineGap = typeof props.lineGap !== "undefined";
  const useLeading = !useLineGap && typeof props.leading !== "undefined";
  const useLineHeight = !useLeading && typeof props.lineHeight !== "undefined";

  // ------------------
  // Cap Height
  //
  // Uses capHeight if set, otherwise fontSize
  // ------------------
  if (useCapHeight) {
    const responsiveCapHeights = calculateResponsiveValues({
      theme,
      props,
      propName: "capHeight",
      themeKey: "capHeights"
    });

    for (let [breakpoint, capHeight] of Object.entries(responsiveCapHeights)) {
      capSizeConfig[breakpoint].capHeight = capHeight;
    }
  } else if (useFontSize) {
    const responsiveFontSizes = calculateResponsiveValues({
      theme,
      props,
      propName: "fontSize",
      themeKey: "fontSizes"
    });

    for (let [breakpoint, fontSize] of Object.entries(responsiveFontSizes)) {
      capSizeConfig[breakpoint].fontSize = fontSize;
    }
  } else {
    // Shouldn't happen thanks to our defaultProp, but there's still a
    // case where `fontSize={null}`, etc.
    throw new Error(
      `One of fontSize or capHeight must be set on a cappedText component`
    );
  }

  // ------------------
  // Line Gap
  //
  // Uses lineGap if set, otherwise leading, otherwise lineHeight
  // ------------------
  if (useLineGap) {
    const responsiveLineGaps = calculateResponsiveValues({
      theme,
      props,
      propName: "lineGap",
      themeKey: "space"
    });

    for (let [breakpoint, lineGap] of Object.entries(responsiveLineGaps)) {
      capSizeConfig[breakpoint].lineGap = lineGap;
    }
  } else if (useLeading) {
    const responsiveLeadings = calculateResponsiveValues({
      theme,
      props,
      propName: "leading",
      themeKey: "sizes"
    });

    for (let [breakpoint, leading] of Object.entries(responsiveLeadings)) {
      capSizeConfig[breakpoint].leading = leading;
    }
  } else if (useLineHeight) {
    const responsiveLineHeights = calculateResponsiveValues({
      theme,
      props,
      propName: "lineHeight",
      themeKey: "lineHeights",
      cssConverter: convertCssToLineheightValue({ capSizeConfig, fontMetrics })
    });

    for (let [breakpoint, lineHeight] of Object.entries(
      responsiveLineHeights
    )) {
      capSizeConfig[breakpoint].leading = lineHeight;
    }
  } else {
    const breakpointKeys = getBreakpointKeysArray(theme);
    // Default to a zero lineGap, allowing the developer to insert their
    // own spacing as desired
    // Note we only set the 'base' value as it will propogate forward through
    // the responsive objects
    capSizeConfig[breakpointKeys[0]].lineGap = 0;
  }

  // ---------------
  // Filling in the blanks
  // ---------------
  // At this point, we have a responsive set of objects;
  // {
  //   base: {
  //     capHeight: 12,
  //     lineGap: 10
  //   },
  //   sm: {
  //     capHeight: 12,
  //   }
  //   md: {
  //     capHeight: 22
  //     lineGap: 14
  //   }
  // }
  //
  // Since there may be blanks, we want to make sure we fill them in (ie; no
  // explicit 'null's, and no missing fields.
  let prevValue = {};
  // NOTE: We iterate over __breakpoints.keys instead of
  // Object.keys(capSizeConfig) because order is important.
  for (let breakpoint of __breakpoints.keys) {
    if (typeof capSizeConfig[breakpoint] === "undefined") {
      continue;
    }

    capSizeConfig[breakpoint] = {
      ...prevValue,
      // Skip 'null' values, letting them be overridden by the previous
      // concrete value
      ...pickBy(capSizeConfig[breakpoint], value => value !== null)
    };
    prevValue = capSizeConfig[breakpoint];
  }

  // Then we simplify the object down to remove duplicates and save some work by
  // capSize.
  capSizeConfig = simplifyResponsiveValues({ theme, value: capSizeConfig });

  // ---------------
  // Running capSize
  // ---------------
  // Once we've filled in the blanks, we will use capSize to create the style
  // objects:
  // {
  //   base: {
  //     fontSize: 10,
  //     ::before: { content: '' }
  //   },
  //   sm: {
  //     fontSize: 10,
  //     ::before: { content: '' }
  //   }
  //   md: {
  //     fontSize: 15,
  //     ::before: { content: '' }
  //   }
  // }
  const capSizeStyleObjects = {};
  // Note: we don't care what order we do this step in, as long as every key is
  // hit. So we can use Object.keys(capSizeConfig)
  for (let breakpoint of Object.keys(capSizeConfig)) {
    // Generate the correct styles for the breakpoint
    capSizeStyleObjects[breakpoint] = createStyleObject(
      capSizeConfig[breakpoint]
    );
  }

  // ---------------
  // Responsive values
  // ---------------
  // Next, We want to change this into a set of values that are responsive:
  // {
  //   fontSize: {
  //     base: 10,
  //     sm: 10,
  //     md: 15
  //   },
  //   ::before: {
  //     content: {
  //       base: '',
  //       sm: '',
  //       md: ''
  //     }
  //   }
  // }
  //
  const result = {};

  for (let [breakpoint, capSizeStyleObject] of Object.entries(
    capSizeStyleObjects
  )) {
    // Then flatten it out into the result object
    for (let styleKey in capSizeStyleObject) {
      result[styleKey] = result[styleKey] || {};
      if (typeof capSizeStyleObject[styleKey] === "object") {
        // Pseudo selectos (`::before`, etc)
        for (let pseudoStyleKey in capSizeStyleObject[styleKey]) {
          result[styleKey][pseudoStyleKey] =
            result[styleKey][pseudoStyleKey] || {};
          result[styleKey][pseudoStyleKey][breakpoint] =
            capSizeStyleObject[styleKey][pseudoStyleKey];
        }
      } else {
        // scalar values (`fontSize`, etc)
        result[styleKey][breakpoint] = capSizeStyleObject[styleKey];
      }
    }
  }

  // ---------------
  // Simplifying things
  // ---------------
  // Then finally, we want to simplify those responsive objects down where
  // possible:
  // {
  //   fontSize: {
  //     base: 10,
  //     md: 15
  //   },
  //   ::before: { content: '' }
  // }
  // Do a last pass over the objects to simplify them. Can happen when multiple
  // breakpoint specify the same lineGap, but different capSize for example.
  for (let styleKey in result) {
    if (theme.__breakpoints.isResponsive(result[styleKey])) {
      // Scalar values (`fontSize`, etc)
      result[styleKey] = simplifyResponsiveValues({
        theme,
        value: result[styleKey],
        collapseBase: true
      });
    } else {
      // Pseudo selectors (`::before`, etc)
      for (let pseudoStyleKey in result[styleKey]) {
        result[styleKey][pseudoStyleKey] = simplifyResponsiveValues({
          theme,
          value: result[styleKey][pseudoStyleKey],
          collapseBase: true
        });
      }
    }
  }

  return result;
};
