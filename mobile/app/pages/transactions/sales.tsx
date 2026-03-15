import AlertModal from "@/components/AlertModal";
import { SooBottomSheet } from "@/components/SooBottomSheetController";
import { getSellerRequests, updateRequestStatus } from "@/lib/api/api";
import { TransactionRequest } from "@/lib/api/apiModel";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SalesPage: React.FC = () => {
  const navigation = useNavigation();
  const user = useUserStore((s) => s.user);
  const [requests, setRequests] = useState<TransactionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getSellerRequests(user.id);
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

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [user]),
  );

  const handleStatusUpdate = async (
    requestId: string,
    status: "approved" | "rejected",
    itemId: string,
  ) => {
    try {
      await updateRequestStatus(requestId, status, itemId);

      // Update local state
      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status } : req)),
      );

      SooBottomSheet.push({
        child: (
          <AlertModal
            title={status === "approved" ? "Reserved!" : "Rejected"}
            description={`Request has been ${status}.`}
            status={status === "approved" ? "success" : "failed"}
            onClose={() => SooBottomSheet.pop()}
          />
        ),
      });

      // Refresh list to ensure consistency across items (e.g. if item status changed)
      fetchRequests();
    } catch (error) {
      console.error("Update status error:", error);
      Alert.alert("Error", "Failed to update request status.");
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 mr-2 rounded-full bg-gray-50"
        >
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-black">Incoming Requests</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {requests.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500">No incoming requests yet.</Text>
          </View>
        ) : (
          requests.map((req) => (
            <View
              key={req.id}
              className="bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center">
                  <Image
                    source={{
                      uri:
                        req.buyer?.avatar_url ||
                        "https://randomuser.me/api/portraits/lego/1.jpg",
                    }}
                    className="w-10 h-10 rounded-full bg-gray-200"
                  />
                  <View className="ml-3">
                    <Text className="font-bold text-black">
                      {req.buyer?.first_name} {req.buyer?.last_name}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      Wants to reserve:
                    </Text>
                  </View>
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

              <View className="flex-row bg-gray-50 p-3 rounded-lg mb-4">
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
              </View>

              {req.status === "pending" && (
                <View className="flex-row justify-end space-x-2 gap-2">
                  <TouchableOpacity
                    onPress={() =>
                      handleStatusUpdate(req.id, "rejected", req.item_id)
                    }
                    className="bg-red-50 px-6 py-2 rounded-full border border-red-100"
                  >
                    <Text className="text-red-500 text-sm font-bold">
                      Reject
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      handleStatusUpdate(req.id, "approved", req.item_id)
                    }
                    className="bg-black px-6 py-2 rounded-full"
                  >
                    <Text className="text-white text-sm font-bold">
                      Approve
                    </Text>
                  </TouchableOpacity>
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
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default SalesPage;
