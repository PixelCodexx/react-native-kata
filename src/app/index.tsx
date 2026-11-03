import LandingPage from "@global-components/LandingPage";
import { useRouter } from "expo-router";

const HomeScreen = () => {
  const router = useRouter();
  return <LandingPage onGetStarted={() => router.push("/services")} />;
}

export default HomeScreen;
