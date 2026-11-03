import { landingPageCopy } from "@copy/landingPage";
import Button from "@core-components/Button";
import Link from "@core-components/Link";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./LandingPage.styles";

export type LandingPageProps = {
  onGetStarted: () => void;
};

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.heading}>
          {landingPageCopy.heading}
        </Text>
        {/* Size the frame, not the Image: a required PNG's intrinsic height
            would otherwise override aspectRatio. */}
        <View style={styles.logoFrame}>
          <Image
            accessibilityLabel={landingPageCopy.logoLabel}
            accessibilityRole="image"
            accessible
            resizeMode="contain"
            source={require("@assets/logo.png")}
            style={styles.logo}
          />
        </View>
        <Text style={styles.intro}>{landingPageCopy.intro}</Text>
        <Button onPress={onGetStarted} style={styles.cta}>
          {landingPageCopy.cta}
        </Button>
        <View style={styles.support}>
          <Text accessibilityRole="header" style={styles.supportHeading}>
            {landingPageCopy.supportHeading}
          </Text>
          <Link accessibilityHint="Opens your email app" href={`mailto:${landingPageCopy.supportEmail}`}>
            {landingPageCopy.supportEmail}
          </Link>
          <Link
            accessibilityHint="Calls customer support"
            href={`tel:${landingPageCopy.supportPhone.replace(/\D/g, "")}`}
          >
            {landingPageCopy.supportPhone}
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default LandingPage;
