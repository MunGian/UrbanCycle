import { fetchMarketplaceItems, updateLastViewedCategory } from "@/lib/api/api";
import { MarketplaceItem } from "@/lib/api/apiModel";
import { category, formatPrice } from "@/lib/constants/commonConst";
import { Route } from "@/lib/utils/routes";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

const columnCount = 2;
const cardWidth = Math.max(
  140,
  (Dimensions.get("window").width - 48) / columnCount,
);

const HomePage: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [query, setQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [marketplaceData, setMarketplaceData] = useState<MarketplaceItem[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadItems();
  }, [user]);

  const loadItems = async () => {
    setIsLoading(true);
    const items = await fetchMarketplaceItems();
    setMarketplaceData(items);
    setIsLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const setSelectedCategoryCallback = (cat: string) => {
    setSelectedCategory(cat);
  };

  const onCategoryClicked = () => {
    Keyboard.dismiss();
    SooBottomSheet.push({
      title: "Categories",
      needPadding: false,
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
    if (user) {
      router.push(Route.CartPage);
    } else {
      router.push(Route.LoginPage);
    }
  };

  const updateCategoriesOnView = async (itemCategory: string) => {
    if (!user) return;
    try {
      const newCats = await updateLastViewedCategory(
        user.id,
        itemCategory,
        user.last_categories_viewed || [],
      );
      if (
        JSON.stringify(newCats) !== JSON.stringify(user.last_categories_viewed)
      ) {
        setUser({ ...user, last_categories_viewed: newCats });
      }
    } catch (e) {
      console.error("Failed to update categories", e);
    }
  };
  const navigateToItemDetailsPage = async (item: MarketplaceItem) => {
    (navigation as any).navigate("pages/itemDetails", { item });
    await updateCategoriesOnView(item.listed_item.category);
  };

  const renderItem = ({ item }: { item: MarketplaceItem }) => {
    const isFree = item.listed_item.is_free;
    const priceLabel = isFree
      ? "Free"
      : `${formatPrice(item.listed_item.price!)}`;

    return (
      <Pressable
        key={item.listed_item.id}
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
              source={{
                uri:
                  item.listed_item.images && item.listed_item.images.length > 0
                    ? item.listed_item.images[0]
                    : "https://via.placeholder.com/150",
              }}
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
                {item.listed_item.title}
              </Text>
              <View className="flex-row items-center space-x-1 mb-2">
                <MaterialIcons name="location-on" size={12} color="#9CA3AF" />
                <Text className="text-gray-400 text-xs" numberOfLines={1}>
                  {item.listed_item.location}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center pt-3 border-t border-gray-50">
              <Image
                source={{
                  uri:
                    item.user?.avatar_url ||
                    "https://randomuser.me/api/portraits/lego/1.jpg",
                }}
                className="w-6 h-6 rounded-full border border-gray-100 bg-gray-200"
              />
              <Text
                className="text-gray-500 text-xs ml-2 flex-1 font-medium"
                numberOfLines={1}
              >
                {item.user
                  ? `${item.user.first_name} ${item.user.last_name}`
                  : "Unknown"}
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
              <Text className="text-md text-gray-600 mb-1">
                {user ? "Welcome back," : "Welcome to UrbanCycle,"}
              </Text>

              <Text className="text-3xl font-bold text-black">
                {user
                  ? user?.first_name
                    ? user?.first_name + " " + user?.last_name
                    : "Friend"
                  : "Guest"}
              </Text>
            </View>
            <TouchableOpacity onPress={navigateToCartPage} className="p-2">
              <MaterialIcons name="shopping-cart" size={28} color="black" />
            </TouchableOpacity>
          </View>

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

        <MarketplaceTabs
          query={query}
          selectedCategory={selectedCategory}
          renderItem={renderItem}
          marketplaceData={marketplaceData}
          onRefresh={onRefresh}
          refreshing={refreshing}
          isLoading={isLoading}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default HomePage;
