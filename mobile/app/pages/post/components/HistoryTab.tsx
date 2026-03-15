import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { ListedItem, TransactionRequest } from "@/lib/api/apiModel";
import { getBuyerRequests, getSellerRequests } from "@/lib/api/api";
import { SooBottomSheet } from "@/components/SooBottomSheetController";
import ReviewBottomSheet from "./ReviewBottomSheet";
import { getTransactionReview, getMyReviews } from "@/lib/api/reviews";

interface HistoryTabProps {
  soldItems: ListedItem[];
  onRefresh: () => Promise<void>;
}

type HistoryItemType =
  | { type: "sold_transaction"; data: TransactionRequest; isReviewed: boolean }
  | {
      type: "bought_transaction";
      data: TransactionRequest;
      isReviewed: boolean;
    };

const HistoryTab: React.FC<HistoryTabProps> = ({ soldItems, onRefresh }) => {
  const user = useUserStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyList, setHistoryList] = useState<HistoryItemType[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [sellerReqs, buyerReqs, userReviews] = await Promise.all([
        getSellerRequests(user.id),
        getBuyerRequests(user.id),
        getMyReviews(user.id),
      ]);

      const reviewedTransactionIds = new Set(
        userReviews?.map((r: any) => r.transaction_id),
      );

      const completedSellerReqs = (sellerReqs || []).filter(
        (r) => r.status === "completed",
      );
      const completedBuyerReqs = (buyerReqs || []).filter(
        (r) => r.status === "completed",
      );

      // Combine into a single list
      const combined: HistoryItemType[] = [
        ...completedSellerReqs.map((r) => ({
          type: "sold_transaction" as const,
          data: r,
          isReviewed: reviewedTransactionIds.has(r.id),
        })),
        ...completedBuyerReqs.map((r) => ({
          type: "bought_transaction" as const,
          data: r,
          isReviewed: reviewedTransactionIds.has(r.id),
        })),
      ];

      // Sort by date (descending)
      combined.sort((a, b) => {
        const dateA = new Date(a.data.created_at).getTime();
        const dateB = new Date(b.data.created_at).getTime();
        return dateB - dateA;
      });

      setHistoryList(combined);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, soldItems]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    await fetchData();
  };

  const handleReview = async (
    transaction: TransactionRequest,
    isSeller: boolean,
  ) => {
    if (!user) return;
    const revieweeId = isSeller
      ? transaction.buyer?.id
      : transaction.seller?.id;
    const revieweeName = isSeller
      ? transaction.buyer?.first_name
      : transaction.seller?.first_name;

    if (!revieweeId) return;

    try {
      const review = await getTransactionReview(transaction.id, user.id);
      if (review) {
        Alert.alert("Info", `You have already reviewed ${revieweeName}.`);
        return;
      }
      SooBottomSheet.push({
        title: `Review ${revieweeName}`,
        child: (
          <ReviewBottomSheet
            transactionId={transaction.id}
            reviewerId={user.id}
            revieweeId={revieweeId}
            onReviewSubmitted={() => {
              fetchData();
            }}
          />
        ),
      });
    } catch (error) {
      console.error("Check review error:", error);
    }
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  const renderItem = (item: HistoryItemType) => {
    const transaction = item.data as TransactionRequest;
    const isSeller = item.type === "sold_transaction";
    const otherParty = isSeller ? transaction.buyer : transaction.seller;
    const itemData = transaction.item;

    return (
      <View
        key={`trans-${transaction.id}`}
        className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm"
      >
        <View className="flex-row mb-3 justify-between items-center">
          <View className="flex-row items-center">
            <Text className="text-sm font-bold text-gray-800 mr-2">
              {isSeller ? "Sold to" : "Bought from"}
            </Text>
            <Text className="text-sm font-bold text-black">
              {otherParty?.first_name} {otherParty?.last_name}
            </Text>
          </View>
          <View className="bg-green-100 px-2 py-1 rounded">
            <Text className="text-xs font-bold text-green-600">COMPLETED</Text>
          </View>
        </View>

        <View className="flex-row bg-gray-50 p-3 rounded-lg mb-3">
          {itemData?.images && (
            <Image
              source={{
                uri: Array.isArray(itemData.images)
                  ? itemData.images[0]
                  : (itemData.images as string),
              }}
              className="w-16 h-16 rounded bg-gray-200"
            />
          )}
          <View className="ml-3 flex-1 justify-center">
            <Text className="font-bold text-black text-base">
              {itemData?.title}
            </Text>
            <Text className="text-gray-600 text-sm">RM {itemData?.price}</Text>
          </View>
        </View>

        {!item.isReviewed && (
          <View className="flex-row justify-end">
            <TouchableOpacity
              onPress={() => handleReview(transaction, isSeller)}
              className="bg-black px-4 py-2 rounded-full"
            >
              <Text className="text-white font-bold text-sm">
                {isSeller ? "Review Buyer" : "Review Seller"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-white p-4"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {historyList.length === 0 ? (
        <View className="items-center justify-center py-20">
          <MaterialIcons name="history" size={48} color="#9CA3AF" />
          <Text className="text-gray-500 font-medium mt-4">No history yet</Text>
        </View>
      ) : (
        historyList.map(renderItem)
      )}
      <View className="h-20" />
    </ScrollView>
  );
};

export default HistoryTab;
