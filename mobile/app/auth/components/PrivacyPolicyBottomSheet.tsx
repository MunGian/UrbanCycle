import React from "react";
import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const PrivacyPolicyBottomSheet: React.FC = () => {
  return (
    <ScrollView
      className="flex-1 max-h-[70vh]"
      keyboardShouldPersistTaps={"handled"}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-gray-800 font-bold text-lg mb-2">
        1. Introduction
      </Text>
      <Text className="text-gray-600 text-sm leading-6 mb-4">
        At UrbanCycle, we value your privacy and are committed to protecting
        your personal information. This Privacy Policy describes how we collect,
        use, and disclose your information when you use our mobile application
        and services.
      </Text>

      <Text className="text-gray-800 font-bold text-lg mb-2">
        2. Information We Collect
      </Text>
      <Text className="text-gray-600 text-sm leading-6 mb-4">
        We collect personal information that you provide directly to us when you
        create an account, update your profile, communicate with us, or list
        items for sale. This may include your name, email address, phone number,
        and location data.
      </Text>

      <Text className="text-gray-800 font-bold text-lg mb-2">
        3. How We Use Your Information
      </Text>
      <Text className="text-gray-600 text-sm leading-6 mb-4">
        We use the information we collect to provide and maintain our App,
        improve user experience, communicate with you, monitor usage, and
        detect, prevent, and address technical issues or fraud.
      </Text>

      <Text className="text-gray-800 font-bold text-lg mb-2">
        4. Sharing Your Information
      </Text>
      <Text className="text-gray-600 text-sm leading-6 mb-4">
        We do not sell your personal information. We may share your information
        with third-party service providers who perform services on our behalf,
        such as payment processing or data analysis, under strict
        confidentiality obligations.
      </Text>

      <Text className="text-gray-800 font-bold text-lg mb-2">
        5. Data Security
      </Text>
      <Text className="text-gray-600 text-sm leading-6 mb-4">
        We implement appropriate security measures to protect your personal
        data. However, please be aware that no method of transmission over the
        Internet or method of electronic storage is 100% secure.
      </Text>

      <Text className="text-gray-800 font-bold text-lg mb-2">
        6. Your Rights
      </Text>
      <Text className="text-gray-600 text-sm leading-6 mb-4">
        Depending on your location, you may have rights regarding your personal
        data, such as the right to access, correct, delete, or restrict the use
        of your data. To exercise these rights, please contact us.
      </Text>

      <Text className="text-gray-800 font-bold text-lg mb-2">
        7. Cookies and Tracking Technologies
      </Text>
      <Text className="text-gray-600 text-sm leading-6 mb-4">
        We use cookies and similar tracking technologies to track activity on
        our App and hold certain information to enhance your experience.
      </Text>

      <Text className="text-gray-800 font-bold text-lg mb-2">
        8. Changes to This Policy
      </Text>
      <Text className="text-gray-600 text-sm leading-6 mb-4">
        We may update our Privacy Policy from time to time. We will notify you
        of any changes by posting the new Privacy Policy on this page.
      </Text>

      <Text className="text-gray-800 font-bold text-lg mb-2">
        9. Contact Us
      </Text>
      <Text className="text-gray-600 text-sm leading-6 mb-12">
        If you have any questions about this Privacy Policy, please contact us
        at privacy@urbancycle.com.
      </Text>
    </ScrollView>
  );
};

export default PrivacyPolicyBottomSheet;
