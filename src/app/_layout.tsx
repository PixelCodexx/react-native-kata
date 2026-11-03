import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@utils/queryClient";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

const RootLayout = () => {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerBackButtonDisplayMode: "minimal",
            headerShadowVisible: false,
            headerTitle: "",
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="services/index" />
          <Stack.Screen name="book/[appointmentId]" />
          {/* Booking can't be undone by going back. */}
          <Stack.Screen name="confirmation/[appointmentId]" options={{ gestureEnabled: false, headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default RootLayout;
