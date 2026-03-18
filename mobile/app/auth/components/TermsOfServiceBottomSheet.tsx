import React from "react";
import { Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const TermsOfServiceBottomSheet: React.FC = () => {
  return (
    <ScrollView
      className="flex-1 max-h-[70vh]"
      keyboardShouldPersistTaps={"handled"}
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-gray-800 font-bold text-lg mb-2">
        1. Acceptance of Terms
      </Text>
      <Text className="text-gray-600 text-sm leading-6 mb-4">
        By accessing and using the UrbanCycle mobile application
        (&quot;App&quot;), you agree to be bound by these Terms of Service
        (&quot;Terms&quot;). If you do not agree to these Terms, please do not
        use the App.
      </Text>

      <Text className="text-gray-800 font-bold text-lg mb-2">
        2. Description of Service
      </Text>
      <Text className="text-gray-600 text-sm leading-6 mb-4">
        UrbanCycle provides a platform for users to buy, sell, and recycle items
        within their community. We facilitate connections between buyers and
        sellers but are not a party to any transaction between users.
      </Text>

      <Text className="text-gray-800 font-bold text-lg mb-2">
        3. User Accounts
      </Text>
      <Text className="text-gray-600 text-sm leading-6 mb-4">
        You may need to register for an account to access certain features. You
        are responsible for maintaining the confidentiality of your account
        information and for all activities that occur under your account. You
        agree to provide accurate and complete information during registration.
      </Text>

      <Text className="text-gray-800 font-bold text-lg mb-2">
        4. User Conduct
      </Text>
      <Text className="text-gray-600 text-sm leading-6 mb-4">
        You agree not to use the App for any unlawful purpose or in any way that
        interrupts, damages, or impairs the service. You may not post content
        that is illegal, offensive, or infringes on the rights of others.
      </Text>

      <Text className="text-gray-800 font-bold text-lg mb-2">
        5. Transactions
      </Text>
      <Text className="text-gray-600 text-sm leading-6 mb-4">
        Any transaction made through the App is solely between you and the other
        party. UrbanCycle is not responsible for the quality, safety, or
        legality of the items advertised, the truth or accuracy of the listings,
        or the ability of sellers to sell items or buyers to pay for items.
      </Text>

      <Text className="text-gray-800 font-bold text-lg mb-2">
        6. Intellectual Property
      </Text>
      <Text className="text-gray-600 text-sm leading-6 mb-4">
        The App and its original content, features, and functionality are owned
        by UrbanCycle and are protected by international copyright, trademark,
        patent, trade secret, and other intellectual property or proprietary
        rights laws.
      </Text>

      <Text className="text-gray-800 font-bold text-lg mb-2">
        7. Termination
      </Text>
      <Text className="text-gray-600 text-sm leading-6 mb-4">
        We may terminate or suspend your account and access to the App
        immediately, without prior notice or liability, for any reason
        whatsoever, including without limitation if you breach the Terms.
      </Text>

      <Text className="text-gray-800 font-bold text-lg mb-2">
        8. Changes to Terms
      </Text>
      <Text className="text-gray-600 text-sm leading-6 mb-4">
        We reserve the right, at our sole discretion, to modify or replace these
        Terms at any time. By continuing to access or use our App after those
        revisions become effective, you agree to be bound by the revised terms.
      </Text>

      <Text className="text-gray-800 font-bold text-lg mb-2">
        9. Contact Us
      </Text>
      <Text className="text-gray-600 text-sm leading-6 mb-12">
        If you have any questions about these Terms, please contact us at
        support@urbancycle.com.
      </Text>
    </ScrollView>
  );
};

export default TermsOfServiceBottomSheet;
