import { wasteTypeManual } from "@/lib/constants/commonConst";
import fallbackWasteImage from "@/assets/images/android.png";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const WasteTypeGuideBottomSheet: React.FC = () => {
  const { width, height } = Dimensions.get("window");
  const [viewerSources, setViewerSources] = useState<ImageSourcePropType[]>([]);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerKey, setViewerKey] = useState(0);

  const openImageViewer = (
    sources: ImageSourcePropType[],
    startIndex: number,
  ) => {
    setViewerSources(sources);
    setViewerStartIndex(startIndex);
    setViewerIndex(startIndex);
    setViewerKey((prev) => prev + 1);
  };

  const closeImageViewer = () => {
    setViewerSources([]);
    setViewerStartIndex(0);
    setViewerIndex(0);
  };

  return (
    <>
      <ScrollView
        className="bg-white max-h-[700px]"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pb-8">
          <Text className="text-sm text-gray-500 mb-3">
            Use this manual to match waste more accurately before submitting
            your report.
          </Text>
          <Text className="text-xs text-gray-400 mb-4">
            Tip: upload a close-up photo that clearly shows the material.
          </Text>

          {wasteTypeManual.map((item) => {
            const sampleImageUrls =
              item.sampleImageUrls?.filter((url) => url.trim().length > 0) ??
              [];
            const sampleImageSources: ImageSourcePropType[] =
              sampleImageUrls.length > 0
                ? sampleImageUrls.map((url) => ({ uri: url }))
                : [fallbackWasteImage, fallbackWasteImage, fallbackWasteImage];

            return (
              <View
                key={item.type}
                className="rounded-2xl border border-gray-100 p-4 mb-3"
              >
                <View className="flex-row items-start mb-2">
                  <MaterialIcons
                    name={
                      item.icon as React.ComponentProps<
                        typeof MaterialIcons
                      >["name"]
                    }
                    size={20}
                    color="#111827"
                  />
                  <Text className="ml-2 text-sm font-semibold text-gray-900 flex-1">
                    {item.type}
                  </Text>
                </View>

                <Text className="text-xs text-gray-600 mb-2">
                  {item.visualCue}
                </Text>

                <Text className="text-xs text-gray-500 mb-1">
                  Sample images :
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-3"
                  contentContainerStyle={{ paddingRight: 4 }}
                >
                  {sampleImageSources.map((source, imageIndex) => (
                    <TouchableOpacity
                      key={`${item.type}-img-${imageIndex}`}
                      activeOpacity={0.8}
                      onPress={() =>
                        openImageViewer(sampleImageSources, imageIndex)
                      }
                    >
                      <Image
                        source={source}
                        className="w-40 h-28 rounded-xl bg-gray-100 mr-2"
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text className="text-xs text-gray-500 mb-1">
                  Report examples
                </Text>
                <View className="flex-row flex-wrap mb-2">
                  {item.examples.map((example) => (
                    <View
                      key={example}
                      className="bg-gray-100 rounded-full px-2 py-1 mr-2 mb-2"
                    >
                      <Text className="text-[11px] text-gray-700">
                        {example}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal
        visible={viewerSources.length > 0}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageViewer}
      >
        <View className="flex-1 bg-black">
          <TouchableOpacity
            onPress={closeImageViewer}
            className="absolute top-12 right-4 z-10 bg-black/50 rounded-full p-2"
          >
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>

          <FlatList
            key={`manual-viewer-${viewerKey}`}
            data={viewerSources}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={viewerStartIndex}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(
                event.nativeEvent.contentOffset.x / width,
              );
              setViewerIndex(nextIndex);
            }}
            keyExtractor={(_, index) => `viewer-image-${index}`}
            renderItem={({ item }) => (
              <View
                style={{ width }}
                className="flex-1 justify-center items-center"
              >
                <Image
                  source={item}
                  style={{ width, height: height * 0.8 }}
                  resizeMode="contain"
                />
              </View>
            )}
          />

          <View className="absolute bottom-10 self-center bg-black/60 rounded-full px-3 py-1">
            <Text className="text-white text-xs">
              {viewerIndex + 1} / {viewerSources.length}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default WasteTypeGuideBottomSheet;
