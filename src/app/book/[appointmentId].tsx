import BookingPage from "@global-components/BookingPage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";

const BookScreen = () => {
  const router = useRouter();
  const { appointmentId, serviceId } = useLocalSearchParams<{ appointmentId: string; serviceId?: string }>();
  const headerHeight = useHeaderHeight();

  return (
    <BookingPage
      appointmentId={appointmentId}
      serviceId={Number(serviceId)}
      keyboardOffset={headerHeight}
      // Replace so "back" from the confirmation can't land on a used form.
      onBooked={(id) => router.replace({ pathname: "/confirmation/[appointmentId]", params: { appointmentId: id } })}
      // Back to the services list even when this screen was opened from a link.
      onChooseAnother={() => router.dismissTo("/services")}
    />
  );
}

export default BookScreen;
