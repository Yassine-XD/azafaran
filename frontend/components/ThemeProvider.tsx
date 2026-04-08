// ThemeProvider.tsx
import { View } from 'react-native';
import { lightTheme } from '../theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
      <View style={lightTheme} className="light flex-1 bg-background">
        {children}
      </View>
  );
}
