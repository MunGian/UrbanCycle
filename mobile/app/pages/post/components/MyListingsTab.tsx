import AlertModal from "@/components/AlertModal";
import { SooBottomSheet } from "@/components/SooBottomSheetController";
import {
  deleteItem,
  getApprovedTransactionByItem,
  markTransactionAsCompleted,
  updateItem,
} from "@/lib/api/api";
import { ListedItem } from "@/lib/api/apiModel";
import { formatPrice } from "@/lib/constants/commonConst";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ReviewBottomSheet from "./ReviewBottomSheet";
import OptionBottomSheet from "./OptionBottomSheet";

interface MyListingsTabProps {
  listedItems: ListedItem[];
  onRefresh: () => Promise<void>;
  onEdit: (item: ListedItem) => void;
}

const MyListingsTab: React.FC<MyListingsTabProps> = ({
  listedItems,
  onRefresh,
  onEdit,
}) => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const user = useUserStore((s) => s.user);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const handleDelete = async (item: ListedItem) => {
    SooBottomSheet.push({
      child: (
        <AlertModal
          title={"Confirm Deletion"}
          description="Are you sure you want to delete this item?"
          status="success"
          confirmText="Yes, Delete"
          onClose={async () => {
            try {
              await deleteItem(item.id!);
              await onRefresh();
            } catch (error) {
              console.error("Failed to delete item:", error);
              Alert.alert("Error", "Failed to delete item");
            } finally {
              SooBottomSheet.pop();
            }
          }}
        />
      ),
    });
  };

  const handleChangeStatus = (item: ListedItem) => {
    let options = [
      { label: "Active", value: "Active" },
      { label: "Reserved", value: "Reserved" },
      { label: "Sold", value: "Sold" },
    ];
    if (item?.is_free) {
      options = options.filter((option) => option.value !== "Sold");
      options.splice(2, 0, { label: "Donated", value: "Donated" });
    }

    SooBottomSheet.push({
      title: "Change Status",
      child: (
        <OptionBottomSheet
          options={options}
          selectedValue={item.status}
          paddingBottom={24}
          onSelect={async (value) => {
            try {
              if (value === "Sold" || value === "Donated") {
                const transaction = await getApprovedTransactionByItem(
                  item.id!,
                );

                if (transaction) {
                  SooBottomSheet.push({
                    needCloseButton: true,
                    child: (
                      <AlertModal
                        title="Complete Transaction"
                        description={`Did you complete this transaction with ${transaction.buyer?.first_name || "the buyer"}?`}
                        status="success"
                        confirmText="Yes, Complete"
                        onClose={async () => {
                          SooBottomSheet.pop();
                          await markTransactionAsCompleted(
                            transaction.id,
                            item.id!,
                            value as "Sold" | "Donated",
                          );
                          await onRefresh();

                          if (user && transaction.buyer) {
                            setTimeout(() => {
                              SooBottomSheet.push({
                                title: `Rate ${transaction.buyer.first_name}`,
                                child: (
                                  <ReviewBottomSheet
                                    transactionId={transaction.id}
                                    reviewerId={user.id}
                                    revieweeId={transaction.buyer.id}
                                    onReviewSubmitted={() => {}}
                                  />
                                ),
                              });
                            }, 500);
                          }
                        }}
                      />
                    ),
                  });
                  return;
                }
              }

              await updateItem(item.id!, { status: value });
              await onRefresh();
            } catch (error) {
              console.error("Failed to update status:", error);
              Alert.alert("Error", "Failed to update status");
            }
          }}
        />
      ),
    });
  };

  const showOptions = (item: ListedItem) => {
    const options = [
      { label: "Edit", value: "edit" },
      { label: "Delete", value: "delete" },
    ];

    if (item.status === "Reserved") {
      options.splice(1, 0, { label: "Change Status", value: "status" });
    }

    SooBottomSheet.push({
      title: "Options",
      child: (
        <OptionBottomSheet
          options={options}
          selectedValue=""
          paddingBottom={24}
          onSelect={(value) => {
            if (value === "edit") {
              onEdit(item);
            } else if (value === "delete") {
              setTimeout(() => {
                handleDelete(item);
              }, 500);
            } else if (value === "status") {
              setTimeout(() => {
                handleChangeStatus(item);
              }, 500);
            }
          }}
        />
      ),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Reserved":
        return "bg-yellow-100 text-yellow-700";
      case "Donated":
      case "Sold":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View className="py-6 px-4">
        {listedItems.length > 0 ? (
          listedItems.map((item) => (
            <View
              key={item.id}
              className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-sm flex-row"
            >
              <View className="w-28 h-28 bg-gray-100 rounded-xl mr-4 overflow-hidden">
                {item.images ? (
                  <Image
                    source={{ uri: item.images[0] }}
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

              <View className="flex-1 justify-between py-1">
                <View>
                  <View className="flex-row justify-between items-start">
                    <Text
                      className="text-base font-bold text-black flex-1 mr-2"
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <TouchableOpacity onPress={() => showOptions(item)}>
                      <MaterialIcons
                        name="more-horiz"
                        size={20}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center mt-1">
                    <Text
                      className={`text-sm font-bold mr-2 ${item.price === 0 ? "text-green-600" : "text-black"}`}
                    >
                      {item.price === 0
                        ? "Free"
                        : `${formatPrice(item.price!)}`}
                    </Text>
                    <View className="bg-gray-100 px-2 py-0.5 rounded-md">
                      <Text className="text-[10px] font-medium text-gray-600">
                        {item.category}
                      </Text>
                    </View>
                  </View>

                  {item.location && (
                    <View className="flex-row items-center mt-1">
                      <MaterialIcons
                        name="location-on"
                        size={12}
                        color="#9CA3AF"
                      />
                      <Text
                        className="text-xs text-gray-500 ml-1"
                        numberOfLines={1}
                      >
                        {item.location}
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-xs text-gray-400">{item.date}</Text>
                  <Text
                    className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(
                      item.status,
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
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <MaterialIcons name="inventory-2" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-gray-500 font-medium">
              No items listed yet
            </Text>
          </View>
        )}
        <View className="h-24" />
      </View>
    </ScrollView>
  );
};

export default MyListingsTab;
