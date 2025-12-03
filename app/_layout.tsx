import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { ThemeProviderCustom, useThemeCustom } from "@/theme/provider";
import "react-native-reanimated";

function RootLayoutNav() {
  const { isDark } = useThemeCustom();

  return (
    <ThemeProvider value={isDark ? NavigationDarkTheme : NavigationDefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chatroom/[id]" />
        <Stack.Screen name="transfer-credit" />
        <Stack.Screen name="transfer-history" />
        <Stack.Screen name="official-comment" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProviderCustom>
        <RootLayoutNav />
      </ThemeProviderCustom>
    </GestureHandlerRootView>
  );
}
