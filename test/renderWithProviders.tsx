import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react-native";
import { createQueryClient } from "@utils/queryClient";
import type { ReactElement } from "react";

export const renderWithProviders = (ui: ReactElement, queryClient = createQueryClient()) => ({
  queryClient,
  ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
});
