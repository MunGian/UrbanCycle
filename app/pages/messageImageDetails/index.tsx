import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const IMAGE_SIZE = width / COLUMN_COUNT;

export default function GalleryPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const images = params.images ? JSON.parse(params.images as string) : [];

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const handleImagePress = (index: number) => {
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setSelectedIndex(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top"]}>
      <View className="flex-row items-center px-4 py-2 bg-black z-10 -mt-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold ml-4">
          {images.length} Photos
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="flex-row flex-wrap">
          {images.map((img: string, index: number) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleImagePress(index)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: img }}
                style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
                className="border border-black"
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={selectedIndex !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View className="flex-1 bg-black relative">
          <SafeAreaView className="absolute top-0 left-0 right-0 z-10 flex-row justify-between items-center px-0">
            <TouchableOpacity className="p-4" onPress={handleClose}>
              <MaterialIcons name="close" size={30} color="white" />
            </TouchableOpacity>
            <Text className="text-white font-semibold text-lg pr-4">
              {selectedIndex !== null ? selectedIndex + 1 : 0} / {images.length}
            </Text>
          </SafeAreaView>

          {selectedIndex !== null && (
            <FlatList
              ref={flatListRef}
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={selectedIndex}
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
              onMomentumScrollEnd={(ev) => {
                const newIndex = Math.round(
                  ev.nativeEvent.contentOffset.x / width
                );
                setSelectedIndex(newIndex);
              }}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <View
                  style={{ width, height: "100%" }}
                  className="justify-center items-center"
                >
                  <Image
                    source={{ uri: item }}
                    style={{ width: width, height: "100%" }}
                    resizeMode="contain"
                  />
                </View>
              )}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
