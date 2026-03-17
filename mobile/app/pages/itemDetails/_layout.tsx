import AlertModal from "@/components/AlertModal";
import EmphasizedText from "@/components/EmphasizedText";
import { SooBottomSheet } from "@/components/SooBottomSheetController";
import { addToCart } from "@/lib/api/api";
import { MarketplaceItem } from "@/lib/api/apiModel";
import { formatLocalDateTime } from "@/lib/constants/commonConst";
import { supabase } from "@/lib/utils/supabase";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

const ItemDetailsPage: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const user = useUserStore((s) => s.user);
  const [message, setMessage] = useState<string>("");
  const [soldDonatedCount, setSoldDonatedCount] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [positivePercentage, setPositivePercentage] = useState<number>(0);

  const item: MarketplaceItem = route.params?.item;

  const { width } = Dimensions.get("window");
  const [activeIndex, setActiveIndex] = useState(0);

  const images = Array.isArray(item.listed_item.images)
    ? item.listed_item.images
    : [item.listed_item.images];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== activeIndex) {
      setActiveIndex(roundIndex);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!item?.user?.id) return;

      try {
        // Fetch count of Sold/Donated items
        const { count, error: countError } = await supabase
          .from("item")
          .select("*", { count: "exact", head: true })
          .eq("user_id", item.user.id)
          .in("status", ["Sold", "Donated"]);

        if (!countError && count !== null) {
          setSoldDonatedCount(count);
        }

        // Fetch Reviews for user
        const { data: reviews, error: reviewsError } = await supabase
          .from("reviews")
          .select("rating")
          .eq("reviewee_id", item.user.id);

        if (!reviewsError && reviews && reviews.length > 0) {
          const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
          const avg = totalRating / reviews.length;

          // Round to 1 decimal place
          setAverageRating(Math.round(avg * 10) / 10);

          // Calculate Positive % (>= 4 stars)
          const positiveCount = reviews.filter((r) => r.rating >= 4).length;
          const percentage = Math.round((positiveCount / reviews.length) * 100);
          setPositivePercentage(percentage);
        } else {
          setAverageRating(0);
          setPositivePercentage(0);
        }
      } catch (err) {
        console.error("Error fetching user stats:", err);
      }
    };

    fetchStats();
  }, [item]);

  const onUnloginAlert = (description: string) => {
    SooBottomSheet.push({
      needPadding: false,
      isDismissible: true,
      child: (
        <AlertModal
          title="Please login"
          description={description}
          status="failed"
          confirmText="Go to Login"
          onClose={() => {
            SooBottomSheet.pop();
            (navigation as any).navigate("auth");
          }}
        />
      ),
    });
  };

  const handleContactDonor = async () => {
    if (!user) {
      onUnloginAlert("You need to be logged in to send a message.");
      return;
    }

    try {
      // Check if room exists
      const { data: rooms, error: fetchError } = await supabase
        .from("message_room")
        .select("*")
        .or(
          `and(user1_id.eq.${user.id},user2_id.eq.${item.user.id}),and(user1_id.eq.${item.user.id},user2_id.eq.${user.id})`,
        );

      if (fetchError) {
        console.error("Error fetching room:", fetchError);
        throw fetchError;
      }

      let roomId;

      if (rooms && rooms.length > 0) {
        roomId = rooms[0].id;
      } else {
        // Create new room
        const { data: newRoom, error: createError } = await supabase
          .from("message_room")
          .insert({
            user1_id: user.id,
            user2_id: item.user.id,
          })
          .select()
          .single();

        if (createError) throw createError;
        roomId = newRoom.id;
      }

      // If there is a message typed, send it
      if (message.trim()) {
        const { error: msgError } = await supabase.from("message").insert({
          room_id: roomId,
          sender_id: user.id,
          content: message.trim(),
          type: "text",
        });
        if (msgError) console.error("Error sending initial message:", msgError);
        setMessage("");
      }

      (navigation as any).navigate("pages/messageRoom", {
        chatId: roomId,
        name: `${item.user.first_name} ${item.user.last_name}`,
        avatar: item.user.avatar_url,
        itemName: item.listed_item.title,
        isOnline: "false",
      });
    } catch (error) {
      console.error("Error initiating chat:", error);
      Alert.alert("Error", "Could not start chat. Please try again.");
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      onUnloginAlert("You need to be logged in to add items to your cart.");
      return;
    }

    let title = "";
    let description = "";
    let status = "success";
    try {
      await addToCart(user.id, item.listed_item.id);
      title = "Added to Cart";
      description = "This item has been added to your cart.";
    } catch (error: any) {
      status = "failed";
      if (error.code === "23505") {
        title = "Already in Cart";
        description = "This item is already in your cart.";
      } else {
        title = "Error";
        description = "Could not add item to cart. Please try again.";
      }
    } finally {
      SooBottomSheet.push({
        needPadding: false,
        needCloseButton: false,
        child: (
          <AlertModal
            title={title}
            description={description}
            status={status as "success" | "failed"}
            onClose={() => {
              SooBottomSheet.pop();
            }}
          />
        ),
      });
    }
  };

  const navigateToCartPage = () => {
    (navigation as any).navigate("pages/cart");
  };

  return (
    <View className="flex h-full w-full bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={26} color="black" />
        </TouchableOpacity>
        <Text className="text-center text-xl font-bold text-black flex-1">
          Item Details
        </Text>
        {user && (
          <TouchableOpacity onPress={navigateToCartPage} className="p-2 mr-1">
            <MaterialIcons name="shopping-cart" size={28} color="black" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="w-full bg-gray-100 aspect-square overflow-hidden relative">
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <View style={{ width: width, height: width }}>
                <Image
                  source={{ uri: item }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            )}
            keyExtractor={(_, index) => index.toString()}
          />
          {images.length > 1 && (
            <View className="absolute bottom-12 left-0 right-0 flex-row justify-center items-center gap-2">
              {images.map((_, index) => (
                <View
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === activeIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </View>
          )}
        </View>

        <View className="px-5 py-5 bg-white -mt-8 rounded-t-3xl shadow-sm">
          <Text className="text-2xl font-bold text-black mb-0 leading-7">
            {item.listed_item.title}
          </Text>
          <EmphasizedText
            text={
              item.listed_item.is_free
                ? "Free"
                : `<em>RM</em> ${(item.listed_item.price || 0).toLocaleString(
                    "en-MY",
                  )}`
            }
            className={`text-2xl font-bold mt-1 mb-2 ${
              item.listed_item.is_free ? "text-emerald-600" : "text-gray-800"
            }`}
            emClassName="text-xl font-bold"
          />

          <View className="flex flex-row gap-6">
            <View>
              <Text className="text-xs text-gray-500 mb-1">Category</Text>
              <Text className="text-sm font-semibold text-black">
                {item.listed_item.category}
              </Text>
            </View>
            <View>
              <Text className="text-xs text-gray-500 mb-1">Location</Text>
              <Text className="text-sm font-semibold text-black">
                {item.listed_item.location || "N/A"}
              </Text>
            </View>
            <View>
              <Text className="text-xs text-gray-500 mb-1">Posted On</Text>
              <Text className="text-sm font-semibold text-black">
                {formatLocalDateTime(item.listed_item.created_at!) || "N/A"}
              </Text>
            </View>
          </View>

          <View className="border-t border-gray-200 my-4" />

          <View>
            <Text className="text-lg font-bold text-black mb-2">
              Description
            </Text>
            <Text className="text-sm text-gray-600 leading-5">
              {item.listed_item.description}
            </Text>
          </View>

          <View className="border-t border-gray-200 my-6" />

          <Text className="text-lg font-bold text-black mb-3">
            About The Donor
          </Text>
          <View className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm">
            <View className="flex-row items-center mb-4">
              <Image
                source={{
                  uri:
                    item.user?.avatar_url ||
                    "https://randomuser.me/api/portraits/lego/1.jpg",
                }}
                className="w-12 h-12 rounded-full bg-gray-200"
              />

              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-black">
                  {item.user
                    ? `${item.user.first_name} ${item.user.last_name}`
                    : "Unknown"}
                </Text>
                <Text className="text-xs text-gray-500">
                  {item.listed_item.location}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-around py-3 border-t border-gray-200">
              <View className="items-center">
                <Text className="text-lg font-bold text-black">
                  {soldDonatedCount}
                </Text>
                <Text className="text-xs text-gray-500">
                  Items Donated/Sold
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-black">
                  {averageRating === 0 ? "-" : averageRating.toFixed(1)}
                </Text>
                <Text className="text-xs text-gray-500">Rating</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-black">
                  {positivePercentage === 0 ? "-" : positivePercentage + "%"}
                </Text>
                <Text className="text-xs text-gray-500">Positive</Text>
              </View>
            </View>
          </View>
          <View className="h-8" />
        </View>
      </ScrollView>

      <View className="flex-row items-center gap-3 px-4 py-5 border-t border-gray-200 bg-white">
        <TouchableOpacity
          onPress={handleContactDonor}
          className="flex-1 py-3 rounded-full border border-gray-300 flex-row items-center justify-center bg-gray-50"
        >
          <MaterialIcons name="chat-bubble-outline" size={18} color="#374151" />
          <Text className="ml-2 text-gray-700 font-semibold">
            Message {item.user?.first_name || "Donor"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAddToCart}
          className="flex-1 py-3 rounded-full bg-gray-900 flex-row items-center justify-center"
        >
          <MaterialIcons name="add-shopping-cart" size={18} color="white" />
          <Text className="ml-2 text-white font-semibold">Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ItemDetailsPage;
