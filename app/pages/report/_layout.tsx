import React from "react";
import { Text, View } from "react-native";
import ReportTabs from "./components/ReportTabs";

const ReportPage: React.FC = () => {
  return (
    <View className="flex h-full w-full bg-white">
      <View className="px-6 pt-6 pb-4 bg-white">
        <Text className="text-2xl font-bold text-black">Waste Reporting</Text>
      </View>

      <View className="flex-1">
        <ReportTabs />
      </View>
    </View>
  );
};

export default ReportPage;
