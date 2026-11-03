import ServicesPage from "@global-components/ServicesPage";
import { useRouter } from "expo-router";

const ServicesScreen = () => {
  const router = useRouter();
  return (
    <ServicesPage
      onBook={(appointment) =>
        router.push({
          pathname: "/book/[appointmentId]",
          params: { appointmentId: appointment.id, serviceId: String(appointment.serviceId) },
        })
      }
    />
  );
}

export default ServicesScreen;
