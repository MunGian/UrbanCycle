import { AuthPlaceholder } from "@/components/AuthPlaceholder";
import { fetchUserItems } from "@/lib/api/api";
import { ListedItem } from "@/lib/api/apiModel";
import { formatLocalDateTime } from "@/lib/constants/commonConst";
import { useUserStore } from "@/lib/zustand/useUserStore";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import PostTabs from "./components/PostTabs";
import { MaterialIcons } from "@expo/vector-icons";
import { Route } from "@/lib/utils/routes";
import { useRouter } from "expo-router";
import { useIncomingRequests } from "@/lib/hooks/useIncomingRequests";
import { useFocusEffect } from "@react-navigation/native";

const PostPage: React.FC = () => {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const requestCount = useIncomingRequests();

  const [listedItems, setListedItems] = useState<ListedItem[]>([]);
  const [isMounting, setIsMounting] = useState<boolean>(true);

  useFocusEffect(
    useCallback(() => {
      if (user === undefined) return;
      loadItems();
    }, [user]),
  );

  const loadItems = async () => {
    if (!user) return;
    const items = await fetchUserItems(user.id);
    const mappedItems: ListedItem[] = items.map((item: ListedItem) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      location: item.location,
      description: item.description,
      price: item?.is_free ? 0 : item.price,
      status: item.status,
      date: formatLocalDateTime(item.created_at!),
      images: item.images && item.images.length > 0 ? item.images : "",
    }));
    setListedItems(mappedItems);
    setIsMounting(false);
  };

  const handlePostItem = (newItem: ListedItem) => {
    setListedItems((prevItems) => {
      const index = prevItems.findIndex((i) => i.id === newItem.id);
      if (index !== -1) {
        const updatedItems = [...prevItems];
        updatedItems[index] = newItem;
        return updatedItems;
      }
      return [newItem, ...prevItems];
    });
    loadItems();
  };

  const navigateToCartPage = () => {
    if (user) {
      router.push("/pages/transactions/sales");
    } else {
      router.push(Route.LoginPage);
    }
  };

  if (!user) {
    return <AuthPlaceholder />;
  }

  if (isMounting) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2c323d" />
      </View>
    );
  }

  return (
    <View className="flex h-full w-full bg-white">
      <View className="flex flex-row justify-between px-6 pt-6 pb-2 bg-white">
        <Text className="text-2xl font-bold text-black">List Items</Text>
        <TouchableOpacity
          onPress={navigateToCartPage}
          className="relative flex flex-row items-center px-2"
        >
          {requestCount > 0 && (
            <View className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
              <Text className="text-xs font-bold text-white">
                {requestCount > 99 ? "99+" : requestCount}
              </Text>
            </View>
          )}
          <MaterialIcons name="inbox" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <PostTabs
          listedItems={listedItems}
          onPostItem={handlePostItem}
          onRefresh={loadItems}
          isMounting={isMounting}
        />
      </View>
    </View>
  );
};

export default PostPage;
