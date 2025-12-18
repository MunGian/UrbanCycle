import { CartItem } from "@/lib/api/apiModel";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { SafeAreaView } from "react-native-safe-area-context";

const CartPage: React.FC = () => {
  const navigation = useNavigation();
  const [manageMode, setManageMode] = useState<Record<string, boolean>>({});

  // Dummy Cart Data
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Batik Shirt (L)",
      price: 0, // Free item
      seller: "Chistina Wong",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      image:
        "https://down-my.img.susercontent.com/file/5db95a7b3ae1cc252074372639693cf5",
      quantity: 1,
      location: "Gelugor",
      selected: false,
      category: "Clothing",
    },
    {
      id: "5",
      name: "Dell Laptop (i5, 8GB RAM)",
      price: 0, // Free item
      seller: "Ricky Owen",
      avatar: "https://randomuser.me/api/portraits/men/46.jpg",
      image:
        "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/dell-plus/db16255/media-gallery/non-touch/laptop-dell-plus-db16255nt-ice-bl-fpr-gallery-5.psd?fmt=png-alpha&pscan=auto&scl=1&hei=804&wid=979&qlt=100,1&resMode=sharp2&size=979,804&chrss=full",
      quantity: 1,
      location: "Bukit Mertajam",
      selected: false,
      category: "Electronics",
    },
  ]);

  const toggleManageMode = (seller: string) => {
    setManageMode((prev) => ({
      ...prev,
      [seller]: !prev[seller],
    }));
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const toggleSelection = (id: string) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleCheckout = () => {
    const selectedItems = cartItems.filter((item) => item.selected);
    if (selectedItems.length === 0) {
      alert("Please select at least one item to checkout.");
      return;
    }
    alert(`Proceeding to checkout with ${selectedItems.length} items...`);
  };

  const selectedCount = cartItems.filter((item) => item.selected).length;

  // Group items by seller
  const groupedItems = cartItems.reduce(
    (acc, item) => {
      if (!acc[item.seller]) {
        acc[item.seller] = [];
      }
      acc[item.seller].push(item);
      return acc;
    },
    {} as Record<string, CartItem[]>
  );

  return (
    <SafeAreaView className="flex h-full w-full bg-white">
      {/* Header */}
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
                {/* Seller Header */}
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
                  <TouchableOpacity onPress={() => toggleManageMode(seller)}>
                    <Text className="text-gray-500 font-medium">
                      {manageMode[seller] ? "Done" : "Manage"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Items for this seller */}
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
                      {/* Checkbox */}
                      {manageMode[seller] && (
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
                      )}

                      <Image
                        source={{ uri: item.image }}
                        className="w-24 h-24 rounded-xl bg-gray-200"
                      />
                      <View className="flex-1 ml-4">
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
                          </View>
                          {manageMode[seller] && (
                            <TouchableOpacity
                              onPress={() => handleRemoveItem(item.id)}
                              className="p-1"
                            >
                              <MaterialIcons
                                name="delete-outline"
                                size={24}
                                color="#EF4444"
                              />
                            </TouchableOpacity>
                          )}
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
              Looks like you haven't added any items yet.
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

      {/* Checkout Section */}
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
              Confirm Reservation
            </Text>
            <MaterialIcons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default CartPage;
