export const dimensions = {
  avatar: {
    sm: 32,
    md: 42,
    lg: 52,
    xl: 68,
    xxl: 96,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    bubble: 18,
    full: 9999,
  },
  headerHeight: 58,
  inputHeight: 48,
  inputMinHeight: 48,
  inputMaxHeight: 110,
  buttonHeight: 52,
  maxBubbleWidthPercentage: 0.78,
} as const;

export type DimensionTokens = typeof dimensions;
