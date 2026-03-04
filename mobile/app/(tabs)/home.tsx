import React from "react";
import { View } from "react-native";
import HomePage from "../pages/home/_layout";

const Home: React.FC = () => {
  return (
    <View className="flex-1 bg-red-200 justify-center items-center">
      <HomePage />
    </View>
  );
};

export default Home;
