import { servicesCopy } from "@copy/booking";
import Notice from "@core-components/Notice";
import StatusView from "@core-components/StatusView";
import { colors } from "@styles/colors";
import { getErrorMessage } from "@utils/http";
import { queryKeys, useServiceAvailability } from "@utils/queries";
import type { Appointment } from "@utils/types";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RefreshControl, Text } from "react-native";
import Animated, { FadeInDown, LinearTransition } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import ServiceCard from "./ServiceCard";
import styles from "./ServicesPage.styles";

export type ServicesPageProps = {
  onBook: (appointment: Appointment) => void;
};

const ServicesPage = ({ onBook }: ServicesPageProps) => {
  const queryClient = useQueryClient();
  const { status, items, error, refreshError, retryFailed } = useServiceAvailability();
  const fetching = useIsFetching() > 0;
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: queryKeys.services });
      await queryClient.invalidateQueries({ queryKey: queryKeys.appointments });
    } finally {
      setRefreshing(false);
    }
  };

  const heading = (
    <Text accessibilityRole="header" style={styles.heading}>
      {servicesCopy.title}
    </Text>
  );

  if (status !== "success") {
    return (
      <SafeAreaView edges={["bottom", "left", "right"]} style={styles.screen}>
        {heading}
        {status === "loading" ? (
          <StatusView loading message={servicesCopy.loading} />
        ) : (
          <StatusView
            message={getErrorMessage(error)}
            onRetry={retryFailed}
            retryLabel={servicesCopy.retry}
            retrying={fetching}
            tone="error"
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.screen}>
      <Animated.FlatList
        contentContainerStyle={styles.list}
        data={items}
        itemLayoutAnimation={LinearTransition.duration(200)}
        keyExtractor={(item) => String(item.service.id)}
        ListEmptyComponent={<StatusView message={servicesCopy.empty} />}
        ListHeaderComponent={
          <>
            {heading}
            {refreshError ? (
              <Notice
                action={{ label: servicesCopy.retry, onPress: () => void refresh() }}
                message={getErrorMessage(refreshError)}
                tone="error"
              />
            ) : null}
          </>
        }
        ListHeaderComponentStyle={styles.listHeader}
        refreshControl={
          <RefreshControl colors={[colors.primary]} onRefresh={refresh} refreshing={refreshing} tintColor={colors.primary} />
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 60).duration(300)}>
            <ServiceCard
              expanded={item.service.id === expandedId}
              item={item}
              onBook={onBook}
              onRetry={retryFailed}
              onToggle={() => setExpandedId((current) => (current === item.service.id ? null : item.service.id))}
              retrying={fetching}
            />
          </Animated.View>
        )}
      />
    </SafeAreaView>
  );
};

export default ServicesPage;
