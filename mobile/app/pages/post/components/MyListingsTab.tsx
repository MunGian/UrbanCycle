import { SooBottomSheet } from "@/components/SooBottomSheetController";
import { deleteItem, updateItem } from "@/lib/api/api";
import { ListedItem } from "@/lib/api/apiModel";
import { formatPrice } from "@/lib/constants/commonConst";
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const handleDelete = async (item: ListedItem) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteItem(item.id!);
            await onRefresh();
          } catch (error) {
            console.error("Failed to delete item:", error);
            Alert.alert("Error", "Failed to delete item");
          }
        },
      },
    ]);
  };

  const handleChangeStatus = (item: ListedItem) => {
    SooBottomSheet.push({
      title: "Change Status",
      child: (
        <OptionBottomSheet
          options={[
            { label: "Active", value: "Active" },
            { label: "Reserved", value: "Reserved" },
            { label: "Sold", value: "Sold" },
            { label: "Donated", value: "Donated" },
          ]}
          selectedValue={item.status}
          paddingBottom={24}
          onSelect={async (value) => {
            try {
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
    SooBottomSheet.push({
      title: "Options",
      child: (
        <OptionBottomSheet
          options={[
            { label: "Edit", value: "edit" },
            { label: "Change Status", value: "status" },
            { label: "Delete", value: "delete" },
          ]}
          selectedValue=""
          paddingBottom={24}
          onSelect={(value) => {
            if (value === "edit") {
              onEdit(item);
            } else if (value === "delete") {
              handleDelete(item);
            } else if (value === "status") {
              handleChangeStatus(item);
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

  // console.log("Listed Items in MyListingsTab:", listedItems);

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
              {/* Item Image */}
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

              {/* Item Details */}
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
