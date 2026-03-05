import CategoryBottomSheet from "@/app/pages/home/components/CategoryBottomSheet";
import { SooBottomSheet } from "@/components/SooBottomSheetController";
import { submitReport, uploadReportImage } from "@/lib/api/api";
import { Report } from "@/lib/api/apiModel";
import { wasteTypes } from "@/lib/constants/commonConst";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapBottomSheet from "./MapBottomSheet";
import AlertModal from "@/components/AlertModal";

const SubmitReportTab: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [coordinate, setCoordinate] = useState<
    { latitude: number; longitude: number } | undefined
  >(undefined);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const setHasOpenedPicker = useUserStore((s) => s.setHasOpenedPicker);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to submit a report.");
      return;
    }

    setLoading(true);
    try {
      const uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        for (const imgUri of images) {
          const url = await uploadReportImage(user.id, imgUri);
          uploadedImageUrls.push(url);
        }
      }

      const reportData: Omit<Report, "id" | "status" | "created_at"> = {
        user_id: user.id,
        location,
        latitude: coordinate?.latitude || null,
        longitude: coordinate?.longitude || null,
        description,
        type: selectedType,
        images: uploadedImageUrls,
      };

      await submitReport(reportData);

      SooBottomSheet.push({
        title: "",
        needPadding: false,
        isDismissible: false,
        needCloseButton: false,
        child: (
          <AlertModal
            title="Report Submitted!"
            description="Thank you for helping us keep the city clean. Your report has been successfully submitted and will be reviewed shortly."
            status="success"
            onClose={() => {
              setLocation("");
              setDescription("");
              setSelectedType("");
              setCoordinate(undefined);
              setImages([]);
              SooBottomSheet.pop();
            }}
          />
        ),
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onOpenMap = () => {
    Keyboard.dismiss();
    SooBottomSheet.push({
      title: "Select Location",
      needPadding: false,
      isDismissible: true,
      child: (
        <MapBottomSheet
          onSelectLocation={(coord, address) => {
            setCoordinate(coord);
            setLocation(address);
          }}
          initialLocation={coordinate}
        />
      ),
    });
  };

  const pickImage = async () => {
    setHasOpenedPicker(true);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library.",
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const onWasteTypeClicked = () => {
    Keyboard.dismiss();
    SooBottomSheet.push({
      title: "Select Waste Type",
      needPadding: false,
      child: (
        <CategoryBottomSheet
          category={wasteTypes}
          selectedCategory={selectedType}
          setSelectedCategoryCallback={(type) => {
            setSelectedType(type);
            SooBottomSheet.pop();
          }}
        />
      ),
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
    >
      <View className="px-6 py-6 pb-10">
        {/* Location Input */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Location
          </Text>
          <View className="flex-row items-center gap-2 mb-2">
            <TouchableOpacity
              className="flex-1 flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
              onPress={onOpenMap}
            >
              <MaterialIcons name="map" size={20} color="#000" />
              <Text className="ml-2 text-black flex-1" numberOfLines={1}>
                {location || "Select location on map"}
              </Text>
              <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Waste Type */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Waste Type
          </Text>
          <TouchableOpacity
            className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
            onPress={onWasteTypeClicked}
          >
            <Text
              className={`flex-1 ${selectedType ? "text-black" : "text-gray-400"}`}
            >
              {selectedType || "Select waste type"}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Description
          </Text>
          <View className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 h-32">
            <TextInput
              className="flex-1 text-black text-top"
              placeholder="Describe the issue..."
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        {/* Photo Upload */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Add Photos
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              onPress={pickImage}
              className="w-24 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center mr-3"
            >
              <MaterialIcons name="add-a-photo" size={24} color="#9CA3AF" />
              <Text className="text-xs text-gray-400 mt-1">Add Photo</Text>
            </TouchableOpacity>
            {images.map((uri, index) => (
              <View key={index} className="relative mr-3">
                <Image source={{ uri }} className="w-24 h-24 rounded-xl" />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                >
                  <MaterialIcons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={
            loading ||
            !location ||
            !description ||
            !selectedType ||
            images.length === 0
          }
          className={`bg-black py-4 rounded-full items-center shadow-lg ${
            loading ||
            !location ||
            !description ||
            !selectedType ||
            images.length === 0
              ? "opacity-60"
              : ""
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Submit Report</Text>
          )}
        </TouchableOpacity>
      </View>
      <View className="h-48" />
    </ScrollView>
  );
};

export default SubmitReportTab;
