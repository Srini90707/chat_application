import { dimensions, DimensionTokens } from '@/constants/dimensions';
import { lightColors, ThemeColors } from './colors';
import { radius, RadiusTokens } from './radius';
import { spacing, SpacingTokens } from './spacing';
import { typography, TypographyTokens } from './typography';

export interface Theme {
  mode: 'light' | 'dark';
  isDark: boolean;
  colors: ThemeColors;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  dimensions: DimensionTokens;
  radius: RadiusTokens;
  borderRadius: RadiusTokens;
}

export const lightTheme: Theme = {
  mode: 'light',
  isDark: false,
  colors: lightColors,
  spacing,
  typography,
  dimensions,
  radius,
  borderRadius: radius,
};
