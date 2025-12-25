import { AuthPlaceholder } from "@/components/AuthPlaceholder";
import { ListedItem } from "@/lib/api/apiModel";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DonatePage: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<"list" | "manage">("manage");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");

  // Dummy Listed Items Data
  const [listedItems, setListedItems] = useState<ListedItem[]>([
    {
      id: "1",
      title: "Vintage Denim Jacket",
      category: "Clothing",
      condition: "Good",
      status: "Active",
      date: "2025-12-06",
      views: 45,
      image: "https://i.ebayimg.com/images/g/mG4AAOSwsMtlTEN~/s-l400.jpg",
    },
    {
      id: "2",
      title: "Wooden Coffee Table",
      category: "Furniture",
      condition: "Fair",
      status: "Pending",
      date: "2025-12-06",
      views: 12,
      image:
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
    },
    {
      id: "3",
      title: "Calculus Textbook",
      category: "Books",
      condition: "Like New",
      status: "Donated",
      date: "2023-10-15",
      views: 89,
      image:
        "https://p4.itc.cn/q_70/images03/20200723/53a69f503bdf4a9e8251a04024e788ce.png",
    },
  ]);

  const categories = [
    "Clothing",
    "Electronics",
    "Furniture",
    "Books",
    "Toys",
    "Other",
  ];

  const conditions = ["New", "Like New", "Good", "Fair", "Poor"];

  const handlePostItem = () => {
    console.log("Posting item:", { title, description, category, condition });

    const newItem: ListedItem = {
      id: Date.now().toString(),
      title: title || "Untitled Item",
      category: category || "Other",
      condition: condition || "Good",
      status: "Active",
      date: new Date().toISOString().split("T")[0],
      views: 0,
    };

    setListedItems([newItem, ...listedItems]);
    setActiveTab("manage");

    // Reset form
    setTitle("");
    setDescription("");
    setCategory("");
    setCondition("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Donated":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (!user) {
    return <AuthPlaceholder />;
  }

  return (
    <SafeAreaView className="flex h-full w-full bg-white">
      {/* Header */}
      <View className="px-6 pt-6 pb-4 bg-white">
        <Text className="text-2xl font-bold text-black">Donate Items</Text>
        <Text className="text-gray-500 text-sm mt-1">
          Give your items a second life
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 mb-6">
        <TouchableOpacity
          onPress={() => setActiveTab("list")}
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "list" ? "border-black" : "border-transparent"
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === "list" ? "text-black" : "text-gray-400"
            }`}
          >
            List Item
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("manage")}
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "manage" ? "border-black" : "border-transparent"
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === "manage" ? "text-black" : "text-gray-400"
            }`}
          >
            My Listings
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "list" ? (
        <ScrollView
          className="flex-1 mb-24"
          showsVerticalScrollIndicator={false}
        >
          <View className="p-6 pt-0">
            {/* Photo Upload */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Photos
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity className="w-24 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center mr-3">
                  <MaterialIcons name="add-a-photo" size={24} color="#9CA3AF" />
                  <Text className="text-xs text-gray-400 mt-1">Add Photo</Text>
                </TouchableOpacity>
                {/* Placeholder for added photos */}
                {/* <Image source={{ uri: '...' }} className="w-24 h-24 rounded-xl mr-3" /> */}
              </ScrollView>
            </View>

            {/* Title */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Title
              </Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 text-black"
                placeholder="What are you donating?"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Category */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full border mr-2 ${
                      category === cat
                        ? "bg-black border-black"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        category === cat ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Condition */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Condition
              </Text>
              <View className="flex-row flex-wrap">
                {conditions.map((cond) => (
                  <TouchableOpacity
                    key={cond}
                    onPress={() => setCondition(cond)}
                    className={`px-4 py-2 rounded-full border mr-2 mb-2 ${
                      condition === cond
                        ? "bg-black border-black"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        condition === cond ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {cond}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Description
              </Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 text-black h-32"
                placeholder="Describe the item's condition, size, etc."
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handlePostItem}
              className="bg-black rounded-full py-4 items-center shadow-lg"
            >
              <Text className="text-white font-bold text-lg">List Item</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1 mb-24"
          showsVerticalScrollIndicator={false}
        >
          <View className="p-6 pt-0">
            {listedItems.length > 0 ? (
              listedItems.map((item) => (
                <View
                  key={item.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm flex-row"
                >
                  {/* Item Image */}
                  <View className="w-24 h-24 bg-gray-100 rounded-xl mr-4 overflow-hidden">
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <MaterialIcons
                          name="image-not-supported"
                          size={24}
                          color="#9CA3AF"
                        />
                      </View>
                    )}
                  </View>

                  {/* Item Details */}
                  <View className="flex-1 justify-between">
                    <View>
                      <View className="flex-row justify-between items-start">
                        <Text
                          className="text-base font-bold text-black flex-1 mr-2"
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <TouchableOpacity>
                          <MaterialIcons
                            name="more-horiz"
                            size={20}
                            color="#9CA3AF"
                          />
                        </TouchableOpacity>
                      </View>
                      <Text className="text-xs text-gray-500 mt-1">
                        Listed on {item.date}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-2">
                      <View className="flex-row items-center">
                        <MaterialIcons
                          name="visibility"
                          size={14}
                          color="#6B7280"
                        />
                        <Text className="text-xs text-gray-500 ml-1">
                          {item.views} views
                        </Text>
                      </View>
                      <Text
                        className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className="items-center justify-center py-20">
                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <MaterialIcons name="inventory-2" size={32} color="#9CA3AF" />
                </View>
                <Text className="text-gray-500 font-medium">
                  No items listed yet
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default DonatePage;
