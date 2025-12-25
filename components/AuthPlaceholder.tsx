import AppLogo from "@/assets/images/inAppIconUse.png";
import { Route } from "@/lib/utils/routes";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

export const AuthPlaceholder = () => {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white px-8">
      <View className="flex flex-col w-full justify-center items-center">
        <Image
          source={AppLogo}
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
        />
        <View className="h-3" />
        <Text className="text-4xl font-bold">UrbanCycle</Text>
        <View className="h-1" />
        <Text className="text-xl text-center font-medium">
          Join UrbanCycle Today
        </Text>
      </View>
      <Text className="text-base text-center text-gray-500 mb-8 leading-6">
        Sign up to start selling, buying, and donating items in your community.
      </Text>

      <View className="flex-row w-full gap-4">
        <TouchableOpacity
          onPress={() => router.push(Route.LoginPage)}
          className="flex-1 bg-brandPrimary py-4 rounded-full items-center justify-center shadow-sm"
        >
          <Text className="text-black font-bold text-lg">Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(Route.SignUpPage)}
          className="flex-1 bg-gray-100 py-4 rounded-full items-center justify-center border border-gray-200"
        >
          <Text className="text-gray-900 font-bold text-lg">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
