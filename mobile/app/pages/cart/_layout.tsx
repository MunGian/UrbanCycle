import AlertModal from "@/components/AlertModal";
import { SooBottomSheet } from "@/components/SooBottomSheetController";
import {
  getCartItems,
  removeFromCart,
  createReservationRequest,
} from "@/lib/api/api";
import { CartItem, MarketplaceItem } from "@/lib/api/apiModel";
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
import Swipeable from "react-native-gesture-handler/Swipeable";

const CartPage: React.FC = () => {
  const navigation = useNavigation();
  const user = useUserStore((s) => s.user);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchCartItems();
    }, [user]),
  );

  const fetchCartItems = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await getCartItems(user.id);
      if (data) {
        const mappedItems: CartItem[] = data.map((record: any) => {
          const item = record.item;
          const seller = item.user;

          let imageUrl = "";
          if (Array.isArray(item.images) && item.images.length > 0) {
            imageUrl = item.images[0];
          } else if (typeof item.images === "string") {
            try {
              const parsed = JSON.parse(item.images);
              if (Array.isArray(parsed) && parsed.length > 0) {
                imageUrl = parsed[0];
              } else {
                imageUrl = item.images;
              }
            } catch {
              imageUrl = item.images;
            }
          }

          return {
            id: record.id,
            itemId: item.id,
            name: item.title,
            price: item.price || 0,
            seller: seller
              ? `${seller.first_name} ${seller.last_name}`
              : "Unknown Seller",
            avatar:
              seller?.avatar_url ||
              "https://randomuser.me/api/portraits/lego/1.jpg",
            image: imageUrl,
            quantity: record.quantity,
            location: item.location,
            selected: false,
            category: item.category,
            isFree: item.is_free,
            originalItem: {
              user: seller,
              listed_item: item,
            },
          };
        });

        setCartItems(mappedItems);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      SooBottomSheet.push({
        needPadding: false,
        isDismissible: false,
        needCloseButton: false,
        child: (
          <AlertModal
            title="Error"
            description="Could not fetch cart items."
            status="failed"
            onClose={() => {
              SooBottomSheet.pop();
            }}
          />
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToItemDetailsPage = (item: MarketplaceItem) => {
    (navigation as any).navigate("pages/itemDetails", { item });
  };

  const handleRemoveItem = async (id: string) => {
    try {
      const { error } = await removeFromCart(id);
      if (error) {
        console.error("Remove error:", error);
        Alert.alert("Error", "Could not remove item.");
        return;
      }
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      console.error("Unexpected error:", e);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const toggleSelection = (id: string) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const handleCheckout = async () => {
    const selectedItems = cartItems.filter((item) => item.selected);
    setLoading(true);
    try {
      if (!user) {
        Alert.alert("Error", "User not found.");
        return;
      }
      for (const item of selectedItems) {
        if (!item.originalItem?.listed_item.id || !item.originalItem.user.id) {
          console.error("Invalid item data:", item);
          continue;
        }

        // Send request
        await createReservationRequest(
          user.id,
          item.originalItem.user.id,
          item.originalItem.listed_item.id,
        );

        // Remove from cart locally and remotely
        await removeFromCart(item.id);
      }

      setCartItems((prev) => prev.filter((item) => !item.selected));

      SooBottomSheet.push({
        child: (
          <AlertModal
            title="Success"
            description="Reservation requests sent! You will be notified once the seller approves."
            status="success"
            onClose={() => SooBottomSheet.pop()}
          />
        ),
      });
    } catch (error) {
      console.error("Checkout error:", error);
      Alert.alert("Error", "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = cartItems.filter((item) => item.selected).length;

  const groupedItems = cartItems.reduce(
    (acc, item) => {
      if (!acc[item.seller]) {
        acc[item.seller] = [];
      }
      acc[item.seller].push(item);
      return acc;
    },
    {} as Record<string, CartItem[]>,
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <View className="flex h-full w-full bg-white">
      <View className="px-4 pt-4 pb-2 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 mr-2 rounded-full bg-gray-50"
        >
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-black">My Cart</Text>
      </View>

      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
      >
        {cartItems.length > 0 ? (
          <View className="px-4 pb-4">
            {Object.entries(groupedItems).map(([seller, items]) => (
              <View key={seller} className="mb-2">
                <View className="flex-row items-center justify-between pt-6 pb-2 border-b border-gray-100">
                  <View className="flex-row items-center">
                    <Image
                      source={{ uri: items[0].avatar }}
                      className="w-6 h-6 rounded-full bg-gray-200"
                    />
                    <Text className="text-base font-bold text-black ml-2">
                      {seller}
                    </Text>
                  </View>
                </View>

                {items.map((item) => (
                  <Swipeable
                    key={item.id}
                    renderRightActions={() => (
                      <TouchableOpacity
                        onPress={() => handleRemoveItem(item.id)}
                        className="bg-red-500 justify-center items-center w-20 h-full"
                      >
                        <MaterialIcons
                          name="delete-outline"
                          size={28}
                          color="white"
                        />
                      </TouchableOpacity>
                    )}
                  >
                    <View className="flex-row py-4 border-b border-gray-100 items-center bg-white">
                      <TouchableOpacity
                        onPress={() => toggleSelection(item.id)}
                        className="mr-3"
                      >
                        <MaterialIcons
                          name={
                            item.selected
                              ? "check-box"
                              : "check-box-outline-blank"
                          }
                          size={24}
                          color={item.selected ? "black" : "#D1D5DB"}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="flex-1 flex-row items-center"
                        onPress={() =>
                          item.originalItem &&
                          navigateToItemDetailsPage(item.originalItem)
                        }
                      >
                        <Image
                          source={{ uri: item.image }}
                          className="w-24 h-24 rounded-xl bg-gray-200"
                        />
                        <View className="flex-1 ml-4 self-stretch justify-between">
                          <View className="flex-row justify-between items-start">
                            <View className="flex-1 mr-2">
                              <Text
                                className="text-base font-bold text-black leading-tight"
                                numberOfLines={2}
                              >
                                {item.name}
                              </Text>
                              <View className="bg-gray-100 self-start px-2 py-0.5 rounded mt-1">
                                <Text className="text-xs text-gray-500">
                                  {item.category}
                                </Text>
                              </View>
                              <Text className="text-sm font-semibold text-gray-800 mt-1">
                                {(item as any).isFree
                                  ? "Free"
                                  : `RM ${item.price.toFixed(2)}`}
                              </Text>
                            </View>
                          </View>

                          <View className="flex-1 justify-end">
                            {item.location && (
                              <View className="flex-row items-center mt-2">
                                <MaterialIcons
                                  name="location-on"
                                  size={14}
                                  color="#6B7280"
                                />
                                <Text className="text-xs text-gray-600 ml-1">
                                  {item.location}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </Swipeable>
                ))}
              </View>
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <MaterialIcons name="shopping-cart" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-black font-bold text-lg">
              Your cart is empty
            </Text>
            <Text className="text-gray-400 text-sm mt-2 text-center px-10">
              Looks like you haven&apos;t added any items yet.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mt-8 bg-black px-8 py-3 rounded-full"
            >
              <Text className="text-white font-bold">Start Browsing</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {cartItems.length > 0 && (
        <View className="p-5 border-t border-gray-100 bg-white pb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-gray-500 text-base font-medium">
              Selected Items
            </Text>
            <Text className="text-xl font-bold text-black">
              {selectedCount}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCheckout}
            className={`py-4 rounded-full items-center shadow-lg flex-row justify-center ${
              selectedCount > 0 ? "bg-black" : "bg-gray-300"
            }`}
            disabled={selectedCount === 0}
          >
            <Text className="text-white font-bold text-lg mr-2">
              Request Reservation
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CartPage;
