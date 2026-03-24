import { getBuyerRequests } from "@/lib/api/api";
import { MarketplaceItem, TransactionRequest } from "@/lib/api/apiModel";
import { supabase } from "@/lib/utils/supabase";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PurchasesPage: React.FC = () => {
  const navigation = useNavigation();
  const user = useUserStore((s) => s.user);
  const [requests, setRequests] = useState<TransactionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [user]),
  );

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getBuyerRequests(user.id);
      if (data) {
        setRequests(data as any);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      Alert.alert("Error", "Could not fetch requests.");
    } finally {
      setLoading(false);
    }
  };

  const navigateToItemDetailsPage = (item: MarketplaceItem) => {
    (navigation as any).navigate("pages/itemDetails", { item });
  };

  const onButtonClick = async (status: string, item: MarketplaceItem) => {
    if (status === "approved") {
      if (!user || !item.user) return;

      try {
        const { data: rooms, error: fetchError } = await supabase
          .from("message_room")
          .select("*")
          .or(
            `and(user1_id.eq.${user.id},user2_id.eq.${item.user.id}),and(user1_id.eq.${item.user.id},user2_id.eq.${user.id})`,
          );

        if (fetchError) throw fetchError;

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
    } else if (status === "completed") {
      (navigation as any).navigate("(tabs)", {
        screen: "post",
        params: {
          screen: "History",
        },
      });
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pt-4 pb-2 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-5">
          <Feather name="arrow-left" size={26} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-black">
          My Reservation Requests
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {requests.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500">No requests sent yet.</Text>
          </View>
        ) : (
          requests.map((req) => (
            <View
              key={req.id}
              className="bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center mt-0.5">
                  <Text className="text-sm text-gray-500 mr-2">Seller:</Text>
                  <Text className="text-sm font-bold text-black">
                    {req.seller?.first_name} {req.seller?.last_name}
                  </Text>
                </View>
                <View
                  className={`px-2 py-1 rounded ${
                    req.status === "approved"
                      ? "bg-green-100"
                      : req.status === "rejected"
                        ? "bg-red-100"
                        : req.status === "completed"
                          ? "bg-green-100"
                          : "bg-yellow-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      req.status === "approved"
                        ? "text-green-700"
                        : req.status === "rejected"
                          ? "text-red-700"
                          : req.status === "completed"
                            ? "text-green-700"
                            : "text-yellow-700"
                    }`}
                  >
                    {req.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Pressable
                className="flex-row bg-gray-50 p-3 rounded-lg mb-2"
                onPress={() => {
                  if (req.item && req.seller && req.status === "pending") {
                    navigateToItemDetailsPage({
                      user: req.seller,
                      listed_item: req.item,
                    });
                  }
                }}
              >
                {req.item?.images && (
                  <Image
                    source={{
                      uri: Array.isArray(req.item.images)
                        ? req.item.images[0]
                        : (req.item.images as string),
                    }}
                    className="w-16 h-16 rounded bg-gray-200"
                  />
                )}
                <View className="ml-3 flex-1 justify-center">
                  <Text className="font-bold text-black text-base">
                    {req.item?.title}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    RM {req.item?.price}
                  </Text>
                </View>
              </Pressable>

              {req.status === "approved" && (
                <View className="mt-2 bg-green-50 p-2 rounded border border-green-100">
                  <Text className="text-green-800 font-medium text-xs">
                    This item has been reserved for you! Contact the seller to
                    proceed.
                  </Text>
                </View>
              )}
              {req.status === "rejected" && (
                <View className="mt-2 bg-red-50 p-2 rounded border border-red-100">
                  <Text className="text-red-800 font-medium text-xs">
                    The seller has rejected your request.
                  </Text>
                </View>
              )}
              {req.status === "completed" && (
                <View className="mt-2 bg-green-50 p-2 rounded border border-green-100">
                  <Text className="text-green-800 text-xs text-start font-medium">
                    Transaction completed! View details and review in History
                    tab.
                  </Text>
                </View>
              )}

              {req.status === "approved" && (
                <View className="flex-row justify-end mt-3">
                  <TouchableOpacity
                    onPress={() =>
                      onButtonClick(req.status, {
                        user: req.seller!,
                        listed_item: req.item!,
                      })
                    }
                    className="bg-black px-6 py-2 rounded-full"
                  >
                    <Text className="text-white text-sm font-bold">
                      {req.status === "approved"
                        ? "Message Seller"
                        : "Leave Review"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

export default PurchasesPage;
