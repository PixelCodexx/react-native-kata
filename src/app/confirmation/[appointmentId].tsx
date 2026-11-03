import ConfirmationPage from "@global-components/ConfirmationPage";
import { useLocalSearchParams, useRouter } from "expo-router";

const ConfirmationScreen = () => {
  const router = useRouter();
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();

  return <ConfirmationPage appointmentId={appointmentId} onBookAnother={() => router.dismissTo("/services")} />;
}

export default ConfirmationScreen;
