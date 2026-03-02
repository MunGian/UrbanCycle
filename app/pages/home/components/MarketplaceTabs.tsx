import { MarketplaceItem } from "@/lib/api/apiModel";
import { penangLocations } from "@/lib/constants/commonConst";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import * as Location from "expo-location";
import React, { FC, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

const Tab = createMaterialTopTabNavigator();

interface MarketplaceTabsProps {
  query: string;
  selectedCategory: string;
  renderItem: (item: { item: MarketplaceItem }) => React.ReactElement;
  marketplaceData: MarketplaceItem[];
  onRefresh: () => Promise<void>;
  refreshing: boolean;
}

interface MarketplaceTabContentProps {
  items: MarketplaceItem[];
  renderItem: (item: { item: MarketplaceItem }) => React.ReactElement;
  emptyMessage?: string;
  onRefresh: () => Promise<void>;
  refreshing: boolean;
}

const MarketplaceTabContent: FC<MarketplaceTabContentProps> = ({
  items,
  renderItem,
  emptyMessage = "No items found.",
  onRefresh,
  refreshing,
}) => {
  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Pressable className="flex-1">
        <View className="flex-row flex-wrap px-2 pb-24 pt-2 justify-between">
          {items.length > 0 ? (
            items.map((item) => renderItem({ item }))
          ) : (
            <View className="items-center justify-center py-8 h-96 w-full">
              <Text className="text-gray-500">{emptyMessage}</Text>
            </View>
          )}
        </View>
      </Pressable>
    </ScrollView>
  );
};

const AllItemsTab: FC<MarketplaceTabsProps> = ({
  query,
  selectedCategory,
  marketplaceData,
  renderItem,
  onRefresh,
  refreshing,
}) => {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return marketplaceData.filter((it) => {
      const matchesCategory =
        selectedCategory === "All" ||
        it.listed_item.category === selectedCategory;
      const matchesQuery =
        q === "" ||
        it.listed_item.title.toLowerCase().includes(q) ||
        (it.user ? `${it.user.first_name} ${it.user.last_name}` : "")
          .toLowerCase()
          .includes(q) ||
        (it.listed_item.location || "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory, marketplaceData]);

  return (
    <MarketplaceTabContent
      items={filtered}
      renderItem={renderItem}
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
};

const FreeItemsTab: FC<MarketplaceTabsProps> = ({
  query,
  selectedCategory,
  marketplaceData,
  renderItem,
  onRefresh,
  refreshing,
}) => {
  const freeItems = useMemo(() => {
    return marketplaceData.filter(
      (item) => item.listed_item.is_free || item.listed_item.price === 0,
    );
  }, [marketplaceData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return freeItems.filter((it) => {
      const matchesCategory =
        selectedCategory === "All" ||
        it.listed_item.category === selectedCategory;
      const matchesQuery =
        q === "" ||
        it.listed_item.title.toLowerCase().includes(q) ||
        (it.user ? `${it.user.first_name} ${it.user.last_name}` : "")
          .toLowerCase()
          .includes(q) ||
        (it.listed_item.location || "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory, freeItems]);

  return (
    <MarketplaceTabContent
      items={filtered}
      renderItem={renderItem}
      emptyMessage="No free items found."
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
};

const NearbyTab: FC<MarketplaceTabsProps> = ({
  query,
  selectedCategory,
  marketplaceData,
  renderItem,
  onRefresh,
  refreshing,
}) => {
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setLoading(false);
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        if (location) {
          const address = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          if (address && address.length > 0) {
            const loc = address[0];

            // Create a search string from all address components to check against our list
            const fullAddressString = `${loc.name || ""} ${loc.street || ""} ${
              loc.district || ""
            } ${loc.city || ""} ${loc.subregion || ""}`.toLowerCase();

            // Try to find if user is in one of our known Penang locations
            const matchedLocation = penangLocations.find((pl) =>
              fullAddressString.includes(pl.toLowerCase()),
            );

            if (matchedLocation) {
              setCurrentLocation(matchedLocation);
            } else {
              // Fallback: use whatever city/district name we got
              const locName =
                loc.city ||
                loc.district ||
                loc.subregion ||
                loc.name ||
                "Unknown Location";
              setCurrentLocation(locName);
            }
          }
        }
      } catch (e) {
        console.error(e);
        setErrorMsg("Failed to fetch location");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const nearbyItems = useMemo(() => {
    if (!currentLocation) return [];

    const loc = currentLocation.toLowerCase();
    return marketplaceData.filter((item) => {
      const itemLocation = (item.listed_item.location || "").toLowerCase();
      return itemLocation.includes(loc) || loc.includes(itemLocation);
    });
  }, [marketplaceData, currentLocation]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return nearbyItems.filter((it) => {
      const matchesCategory =
        selectedCategory === "All" ||
        it.listed_item.category === selectedCategory;
      const matchesQuery =
        q === "" ||
        it.listed_item.title.toLowerCase().includes(q) ||
        (it.user ? `${it.user.first_name} ${it.user.last_name}` : "")
          .toLowerCase()
          .includes(q) ||
        (it.listed_item.location || "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory, nearbyItems]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000000" />
        <Text className="mt-2 text-gray-500">Finding nearby items...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-red-500 text-center mb-2">{errorMsg}</Text>
        <Text className="text-gray-500 text-center">
          Please enable location services to see nearby items.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {currentLocation && (
        <View className="px-4 py-2 bg-gray-50 border-b border-gray-100">
          <Text className="text-gray-600 text-sm">
            Showing items near{" "}
            <Text className="font-bold text-black">{currentLocation}</Text>
          </Text>
        </View>
      )}
      <MarketplaceTabContent
        items={filtered}
        renderItem={renderItem}
        onRefresh={onRefresh}
        refreshing={refreshing}
        emptyMessage={`No items found near ${currentLocation || "you"}.`}
      />
    </View>
  );
};

const ForMeTab: FC<MarketplaceTabsProps> = ({
  query,
  selectedCategory,
  marketplaceData,
  renderItem,
  onRefresh,
  refreshing,
}) => {
  const forMeItems = useMemo(() => {
    const shuffled = [...marketplaceData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.ceil(marketplaceData.length * 0.7));
  }, [marketplaceData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return forMeItems.filter((it) => {
      const matchesCategory =
        selectedCategory === "All" ||
        it.listed_item.category === selectedCategory;
      const matchesQuery =
        q === "" ||
        it.listed_item.title.toLowerCase().includes(q) ||
        (it.user ? `${it.user.first_name} ${it.user.last_name}` : "")
          .toLowerCase()
          .includes(q) ||
        (it.listed_item.location || "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory, forMeItems]);

  return (
    <MarketplaceTabContent
      items={filtered}
      renderItem={renderItem}
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
};

const MarketplaceTabs: FC<MarketplaceTabsProps> = (props) => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
        },
        tabBarIndicatorStyle: {
          backgroundColor: "#000000",
          height: 3,
        },
        tabBarLabelStyle: {
          fontWeight: "700",
          fontSize: 12,
          textTransform: "none",
        },
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#9CA3AF",
        animationEnabled: true,
        tabBarScrollEnabled: true,
      }}
    >
      <Tab.Screen name="AllItems" options={{ title: "All Items" }}>
        {() => <AllItemsTab {...props} />}
      </Tab.Screen>
      <Tab.Screen name="FreeItems" options={{ title: "Free Items" }}>
        {() => <FreeItemsTab {...props} />}
      </Tab.Screen>
      <Tab.Screen name="Nearby" options={{ title: "Nearby" }}>
        {() => <NearbyTab {...props} />}
      </Tab.Screen>
      <Tab.Screen name="ForMe" options={{ title: "For Me" }}>
        {() => <ForMeTab {...props} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MarketplaceTabs;
