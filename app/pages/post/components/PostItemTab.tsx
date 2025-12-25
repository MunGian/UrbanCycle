import CategoryBottomSheet from "@/app/pages/home/components/CategoryBottomSheet";
import ItemPriceBottomSheet from "@/app/pages/post/components/ItemPriceBottomSheet";
import { SooBottomSheet } from "@/components/SooBottomSheetController";
import { insertItem, uploadItemImage } from "@/lib/api/api";
import { ListedItem } from "@/lib/api/apiModel";
import {
  formatLocalDateTime,
  penangLocations,
} from "@/lib/constants/commonConst";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { category } from "../../home/_layout";

interface PostItemTabProps {
  onPostItem: (item: ListedItem) => void;
  jumpToMyListings: () => void;
}

const PostItemTab: React.FC<PostItemTabProps> = ({
  onPostItem,
  jumpToMyListings,
}) => {
  const user = useUserStore((s) => s.user);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [isFree, setIsFree] = useState<boolean>(true);
  const [price, setPrice] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [isTitleFocused, setIsTitleFocused] = useState<boolean>(false);
  const [isPriceFocused, setIsPriceFocused] = useState<boolean>(false);
  const [isDescriptionFocused, setIsDescriptionFocused] =
    useState<boolean>(false);

  const filteredCategories = category.filter((cat) => cat !== "All");

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library."
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

  const setSelectedCategoryCallback = (cat: string) => {
    setSelectedCategory(cat);
    SooBottomSheet.pop();
  };

  const onCategoryClicked = () => {
    Keyboard.dismiss();
    SooBottomSheet.push({
      title: "Categories",
      needPadding: false,
      child: (
        <CategoryBottomSheet
          category={filteredCategories}
          selectedCategory={selectedCategory}
          setSelectedCategoryCallback={setSelectedCategoryCallback}
        />
      ),
    });
  };

  const onPriceClicked = () => {
    SooBottomSheet.push({
      title: "Select Price Type",
      needPadding: false,
      child: (
        <ItemPriceBottomSheet
          isFree={isFree}
          setIsFree={setIsFree}
          setPrice={setPrice}
        />
      ),
    });
  };

  const onLocationClicked = () => {
    Keyboard.dismiss();
    SooBottomSheet.push({
      title: "Locations",
      needPadding: false,
      child: (
        <CategoryBottomSheet
          category={penangLocations}
          selectedCategory={selectedLocation}
          setSelectedCategoryCallback={setSelectedLocation}
        />
      ),
    });
  };

  const handlePostItem = async () => {
    if (!title || !selectedCategory || images.length === 0) {
      Alert.alert(
        "Missing fields",
        "Please fill in all required fields and add at least one photo."
      );
      return;
    }
    if (!isFree && !price) {
      Alert.alert("Missing price", "Please enter a price.");
      return;
    }

    setLoading(true);
    try {
      const uploadedImageUrls = [];
      if (user) {
        for (const imgUri of images) {
          const url = await uploadItemImage(user.id, imgUri);
          if (url) uploadedImageUrls.push(url);
        }
      }

      const newItem = {
        user_id: user?.id,
        title,
        description,
        category: selectedCategory,
        images: uploadedImageUrls,
        is_free: isFree,
        price: isFree ? null : parseFloat(price),
        status: "available",
        location: selectedLocation,
      };

      await insertItem(newItem);

      // Also call the prop callback if needed for local update
      const listedItem: any = {
        id: Date.now().toString(), // Temporary ID for UI
        title,
        category: selectedCategory,
        status: "Active",
        date: formatLocalDateTime(new Date()),
        location: selectedLocation,
        description,
        price: isFree ? 0 : parseFloat(price),
        image: uploadedImageUrls[0],
      };
      onPostItem(listedItem);

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedCategory("");
      setSelectedLocation("");
      setImages([]);
      setIsFree(true);
      setPrice("");

      jumpToMyListings();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to post item.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    title.trim() !== "" &&
    selectedCategory !== "" &&
    selectedLocation !== "" &&
    description.trim() !== "" &&
    images.length > 0 &&
    (isFree || price.trim() !== "");

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
      >
        <View className="p-6">
          {/* Photo Upload */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Photos
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

          {/* Title */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Title
            </Text>
            <View
              className={`flex flex-row w-full items-center justify-between bg-cardBg rounded-xl px-4 py-1 gap-2 border ${
                isTitleFocused ? "border-black" : "border-transparent"
              }`}
            >
              <TextInput
                className="flex-1 text-base text-black"
                placeholder="What are you listing?"
                value={title}
                onChangeText={setTitle}
                onFocus={() => setIsTitleFocused(true)}
                onBlur={() => setIsTitleFocused(false)}
              />
            </View>
          </View>

          {/* Category */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Category
            </Text>
            <TouchableOpacity
              onPress={onCategoryClicked}
              className="bg-cardBg rounded-xl px-4 py-4 border border-transparent flex-row justify-between items-center"
            >
              <Text
                className={`ml-1 ${selectedCategory ? "text-black font-medium" : "text-gray-600"}`}
              >
                {selectedCategory || "Select Category"}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
            </TouchableOpacity>
          </View>

          {/* Price / Free */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Price
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onPriceClicked}
                className="flex-1 bg-cardBg rounded-xl px-4 py-4 border border-transparent flex-row justify-between items-center"
              >
                <Text className={`ml-1 text-black font-medium`}>
                  {isFree ? "Free" : "Paid"}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
              </TouchableOpacity>
              {!isFree && (
                <View
                  className={`flex-1 flex-row items-center bg-cardBg rounded-xl px-4 py-1 gap-2 border ${
                    isPriceFocused ? "border-black" : "border-transparent"
                  }`}
                >
                  <MaterialIcons name="attach-money" size={20} color="black" />
                  <TextInput
                    className="flex-1 text-base text-black"
                    placeholder="Price"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                    onFocus={() => setIsPriceFocused(true)}
                    onBlur={() => setIsPriceFocused(false)}
                  />
                </View>
              )}
            </View>
          </View>

          {/* Category */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Location
            </Text>
            <TouchableOpacity
              onPress={onLocationClicked}
              className="bg-cardBg rounded-xl px-4 py-4 border border-transparent flex-row justify-between items-center"
            >
              <Text
                className={`ml-1 ${selectedLocation ? "text-black font-medium" : "text-gray-600"}`}
              >
                {selectedLocation || "Select Location"}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Description
            </Text>
            <View
              className={`flex flex-row w-full items-start justify-between bg-cardBg rounded-xl px-4 py-3 gap-2 border ${
                isDescriptionFocused ? "border-black" : "border-transparent"
              }`}
            >
              <TextInput
                className="flex-1 text-base text-gray-700 h-32"
                placeholder="Describe the item..."
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
                onFocus={() => setIsDescriptionFocused(true)}
                onBlur={() => setIsDescriptionFocused(false)}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handlePostItem}
            disabled={loading || !isFormValid}
            className={`bg-black rounded-full py-4 items-center shadow-lg ${
              loading || !isFormValid ? "opacity-50" : ""
            }`}
          >
            <Text className="text-white font-bold text-lg">
              {loading ? "Listing..." : "List Item"}
            </Text>
          </TouchableOpacity>

          <View
            className={`${isDescriptionFocused || isPriceFocused ? "h-96" : "h-24"}`}
          />
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default PostItemTab;
