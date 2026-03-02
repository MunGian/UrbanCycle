import { AuthPlaceholder } from "@/components/AuthPlaceholder";
import { fetchUserItems } from "@/lib/api/api";
import { ListedItem } from "@/lib/api/apiModel";
import { formatLocalDateTime } from "@/lib/constants/commonConst";
import { useUserStore } from "@/lib/zustand/useUserStore";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import PostTabs from "./components/PostTabs";

const PostPage: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const [listedItems, setListedItems] = useState<ListedItem[]>([]);
  const [isMounting, setIsMounting] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

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

  if (!user) {
    return <AuthPlaceholder />;
  }

  return (
    <View className="flex h-full w-full bg-white">
      <View className="px-6 pt-6 pb-4 bg-white">
        <Text className="text-2xl font-bold text-black">List Items</Text>
        {/* <Text className="text-gray-500 text-sm mt-1">
          Give your items a second life
        </Text> */}
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
