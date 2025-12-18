import { MarketplaceItem } from "@/api/apiModel";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SooBottomSheet } from "../../../components/SooBottomSheetProvider";
import CategoryBottomSheet from "./components/CategoryBottomSheet";
import MarketplaceTabs from "./components/MarketplaceTabs";

const dummyMarketplaceData: MarketplaceItem[] = [
  {
    id: "1",
    name: "Batik Shirt (L)",
    price: 0,
    seller: "Chistina Wong",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    image:
      "https://down-my.img.susercontent.com/file/5db95a7b3ae1cc252074372639693cf5",
    condition: "Like New",
    category: "Clothing",
    location: "Gelugor",
  },
  {
    id: "2",
    name: "Kebaya Traditional Dress",
    price: 50,
    seller: "Asyikin",
    avatar: "https://randomuser.me/api/portraits/women/72.jpg",
    image:
      "https://plus.unsplash.com/premium_photo-1664790560503-24bdada019f3?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    condition: "Good",
    category: "Clothing",
    location: "Bayan Lepas",
  },
  {
    id: "3",
    name: "Uniqlo Oversized Shirt",
    price: 15,
    seller: "Amir Hassan",
    avatar:
      "https://static.vecteezy.com/system/resources/thumbnails/005/346/410/small/close-up-portrait-of-smiling-handsome-young-caucasian-man-face-looking-at-camera-on-isolated-light-gray-studio-background-photo.jpg",
    image:
      "https://www.uniqlo.com/jp/ja/contents/feature/masterpiece/common/img/product/item_03_kv.jpg?240112",
    condition: "Excellent",
    category: "Clothing",
    location: "Ayer Itam",
  },
  {
    id: "4",
    name: "Leather Sandals (Used)",
    price: 0,
    seller: "Chistina Wong",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop",
    condition: "Good",
    category: "Clothing",
    location: "Jelutong",
  },
  {
    id: "5",
    name: "Dell Laptop (i5, 8GB RAM)",
    price: 450,
    seller: "Ricky Owen",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
    image:
      "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/dell-plus/db16255/media-gallery/non-touch/laptop-dell-plus-db16255nt-ice-bl-fpr-gallery-5.psd?fmt=png-alpha&pscan=auto&scl=1&hei=804&wid=979&qlt=100,1&resMode=sharp2&size=979,804&chrss=full",
    condition: "Good",
    category: "Electronics",
    location: "Bukit Mertajam",
  },
  {
    id: "6",
    name: "iPhone 11 (Refurbished)",
    price: 800,
    seller: "Chris Paul",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    image: "https://m.media-amazon.com/images/I/71vIhOeEIdL.jpg",
    condition: "Used",
    category: "Electronics",
    location: "George Town",
  },
  {
    id: "7",
    name: "Solid Wood Chair Set",
    price: 0,
    seller: "Chris Paul",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    image:
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=400&fit=crop",
    condition: "Good",
    category: "Furniture",
    location: "Butterworth",
  },
  {
    id: "8",
    name: "Recycled Wood Coffee Table",
    price: 120,
    seller: "Asyikin",
    avatar: "https://randomuser.me/api/portraits/women/72.jpg",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
    condition: "Like New",
    category: "Furniture",
    location: "Tanjung Bungah",
  },
  {
    id: "9",
    name: "Metal Shelving Unit (5-tier)",
    price: 35,
    seller: "Ricky Owen",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
    image: "https://m.media-amazon.com/images/I/81Rbsb5FbyL.jpg",
    condition: "Good",
    category: "Furniture",
    location: "Seberang Jaya",
  },
  {
    id: "10",
    name: "Compilers Textbook (Good Condition)",
    price: 0,
    seller: "Chistina Wong",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    image:
      "https://p4.itc.cn/q_70/images03/20200723/53a69f503bdf4a9e8251a04024e788ce.png",
    condition: "Excellent",
    category: "Books",
    location: "Bayan Baru",
  },
  {
    id: "11",
    name: "Terracotta Plant Pots Bundle",
    price: 10,
    seller: "Amir Hassan",
    avatar:
      "https://static.vecteezy.com/system/resources/thumbnails/005/346/410/small/close-up-portrait-of-smiling-handsome-young-caucasian-man-face-looking-at-camera-on-isolated-light-gray-studio-background-photo.jpg",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop",
    condition: "New",
    category: "Home & Garden",
    location: "Balik Pulau",
  },
  {
    id: "12",
    name: "Yoga Mat & Exercise Bands",
    price: 0,
    seller: "Chris Paul",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    image:
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop",
    condition: "Good",
    category: "Sports",
    location: "USM Gelugor",
  },
];

const category = [
  "All",
  "Clothing",
  "Electronics",
  "Furniture",
  "Books",
  "Home & Garden",
  "Sports",
];

const columnCount = 2;
const cardWidth = Math.max(
  140,
  (Dimensions.get("window").width - 48) / columnCount
);

const HomePage: React.FC = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const setSelectedCategoryCallback = (cat: string) => {
    setSelectedCategory(cat);
    SooBottomSheet.pop();
  };

  const onCategoryClicked = () => {
    Keyboard.dismiss();
    SooBottomSheet.push({
      title: "Categories",
      needPadding: true,
      child: (
        <CategoryBottomSheet
          category={category}
          selectedCategory={selectedCategory}
          setSelectedCategoryCallback={setSelectedCategoryCallback}
        />
      ),
    });
  };

  const navigateToCartPage = () => {
    Keyboard.dismiss();
    (navigation as any).navigate("pages/cart");
  };

  const navigateToItemDetailsPage = (item: MarketplaceItem) => {
    (navigation as any).navigate("pages/itemDetails", { item });
  };

  const renderItem = ({ item }: { item: MarketplaceItem }) => {
    const isFree = item.price === 0;
    const priceLabel = isFree
      ? "Free"
      : `RM ${item.price.toLocaleString("en-MY")}`;

    return (
      <Pressable
        key={item.id}
        onPress={() => navigateToItemDetailsPage(item)}
        className="m-2"
        style={{ width: cardWidth }}
      >
        <View
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
          style={{ minHeight: 280 }}
        >
          <View className="relative">
            <Image
              source={{ uri: item.image }}
              className="w-full bg-gray-200"
              style={{ height: 160, resizeMode: "cover" }}
            />
            <View
              className={`absolute top-2 left-2 px-2.5 py-1 rounded-lg shadow-sm ${
                isFree ? "bg-emerald-500" : "bg-black/80"
              }`}
            >
              <Text className="text-white text-xs font-bold">{priceLabel}</Text>
            </View>
          </View>
          <View className="p-3 flex-1 flex flex-col justify-between">
            <View>
              <Text
                className="text-gray-900 font-semibold text-sm leading-5 mb-1"
                numberOfLines={2}
              >
                {item.name}
              </Text>
              <View className="flex-row items-center space-x-1 mb-2">
                <MaterialIcons name="location-on" size={12} color="#9CA3AF" />
                <Text className="text-gray-400 text-xs" numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center pt-3 border-t border-gray-50">
              <Image
                source={{ uri: item.avatar }}
                className="w-6 h-6 rounded-full border border-gray-100 bg-gray-200"
              />
              <Text
                className="text-gray-500 text-xs ml-2 flex-1 font-medium"
                numberOfLines={1}
              >
                {item.seller}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex h-full w-full flex-1 bg-white">
        {/* Header Section */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <Text className="text-md text-gray-600 mb-1">Welcome back,</Text>
              <Text className="text-3xl font-bold text-black">Mun Gian</Text>
            </View>
            <TouchableOpacity onPress={navigateToCartPage} className="p-2">
              <MaterialIcons name="shopping-cart" size={28} color="black" />
            </TouchableOpacity>
          </View>
          {/* <Text className="text-gray-600 text-sm mb-3">
          Buy, sell and reuse — support a circular economy
        </Text> */}

          <View className="flex-row items-center gap-2">
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search items..."
              className="flex-1 bg-gray-100 px-4 py-3 rounded-full border border-gray-300 text-black"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity
              onPress={onCategoryClicked}
              className="p-3 rounded-3xl bg-gray-50 border border-gray-300"
            >
              <MaterialIcons name="tune" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Marketplace Tabs Component */}
        <MarketplaceTabs
          query={query}
          selectedCategory={selectedCategory}
          renderItem={renderItem}
          dummyMarketplaceData={dummyMarketplaceData}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default HomePage;
