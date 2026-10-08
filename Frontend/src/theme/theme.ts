import { darkTheme } from './darkTheme';
import { lightTheme, Theme } from './lightTheme';

// Default static theme for static usage/backwards compatibility
export const theme: Theme = lightTheme;

export { lightTheme, darkTheme };
export type { Theme };
