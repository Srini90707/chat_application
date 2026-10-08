import { dimensions } from '@/constants/dimensions';
import { darkColors } from './colors';
import { Theme } from './lightTheme';
import { radius } from './radius';
import { spacing } from './spacing';
import { typography } from './typography';

export const darkTheme: Theme = {
  mode: 'dark',
  isDark: true,
  colors: darkColors,
  spacing,
  typography,
  dimensions,
  radius,
  borderRadius: radius,
};
