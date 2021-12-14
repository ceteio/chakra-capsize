export const withCappedText = ({ defaultFontSize = 'md', htmlFontSize = 16, fontMetrics }) => ({
  cappedText: {
    fontMetrics,
    htmlFontSize,
  },
  components: {
    Text: {
      defaultProps: {
        fontSize: defaultFontSize
      },
    },
    Heading: {
      defaultProps: {
        fontSize: defaultFontSize
      },
    },
  }
});
