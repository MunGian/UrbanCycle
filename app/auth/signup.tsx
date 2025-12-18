import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Keyboard,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import AppLogo from "@/assets/images/inAppIconUse.png";
import EmphasizedText from "@/components/EmphasizedText";
import { SooBottomSheet } from "@/components/SooBottomSheetProvider";
import SignUpEmailBottomSheet from "./components/SignUpEmailBottomSheet";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
// AppState.addEventListener("change", (state) => {
//   if (state === "active") {
//     console.log("refreshing token......................");
//     supabase.auth.startAutoRefresh();
//   } else {
//     supabase.auth.stopAutoRefresh();
//   }
// });

// console.log("supabase", supabase.auth);
console.log("Sign Upppppppppppppppppppppppp");
const Signup: React.FC = () => {
  // Add this hook to any file using SooBottomSheet
  // Handles bottom sheet back automatically
  // useBottomSheetBackHandler();

  const router = useRouter();

  const onContinuePress = () => {
    SooBottomSheet.push({
      title: "Sign up with Email",
      child: (
        <SignUpEmailBottomSheet />
        // <FlatList
        //   data={[1, 2, 3]}
        //   keyExtractor={(item: any) => item.toString()}
        //   renderItem={() => <SignUpBottomSheet />}
        //   className="max-h-96"
        //   scrollEnabled
        //   nestedScrollEnabled
        //   showsVerticalScrollIndicator={false}
        // />
      ),
      needPadding: true,
    });
  };

  const signUpWithGoogle = async () => {
    console.log("signUpWithGoogle");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 flex-col px-5 pt-5 bg-white">
        <View className="flex flex-row w-full">
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={26} color="black" />
          </TouchableOpacity>
        </View>
        <View className="h-24" />
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
            From Waste to Worth
          </Text>
        </View>
        <View className="h-10" />
        <TouchableOpacity
          onPress={onContinuePress}
          className="flex rounded-full py-4 w-full items-center justify-center bg-gray-200"
        >
          <Text className="text-black text-lg font-medium">
            Continue with Email
          </Text>
        </TouchableOpacity>
        <View className="h-8" />
        <View className="flex flex-row items-center w-full">
          <View className="flex-1 h-[1px] bg-gray-300" />
          <Text className="mx-4 text-base text-gray-500 text-center">
            Or continue with
          </Text>
          <View className="flex-1 h-[1px] bg-gray-300" />
        </View>
        <View className="h-8" />
        <View className="flex flex-col w-full gap-4">
          <TouchableOpacity
            onPress={signUpWithGoogle}
            className="flex flex-row border border-gray-300 rounded-full px-4 py-3 items-center justify-center gap-2"
          >
            <Image
              source={{
                uri: "https://storage.googleapis.com/libraries-lib-production/images/GoogleLogo-canvas-404-300px.original.png",
              }}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
            <Text className="text-lg font-medium">Google</Text>
          </TouchableOpacity>
        </View>
        <View className="h-6" />
        <EmphasizedText
          text="By proceeding with this application, you acknowledge that you have read, understood, and agree to be bound by our <em>Terms of Service</em> and <em>Privacy Policy</em>."
          className="text-gray-700 text-sm leading-relaxed text-justify"
          emClassName="text-blue-600 font-semibold"
          onEmphasizedPress={(emText) => {
            if (emText === "Terms of Service") {
              console.log("Open Terms of Service");
            } else if (emText === "Privacy Policy") {
              console.log("Open Privacy Policy");
            }
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Signup;
