import { MarketplaceItem } from "@/api/apiModel";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React, { FC, useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const Tab = createMaterialTopTabNavigator();

interface MarketplaceTabsProps {
  query: string;
  selectedCategory: string;
  renderItem: (item: { item: MarketplaceItem }) => React.ReactElement;
  dummyMarketplaceData: MarketplaceItem[];
}

interface MarketplaceTabContentProps {
  items: MarketplaceItem[];
  renderItem: (item: { item: MarketplaceItem }) => React.ReactElement;
  emptyMessage?: string;
}

const MarketplaceTabContent: FC<MarketplaceTabContentProps> = ({
  items,
  renderItem,
  emptyMessage = "No items found.",
}) => {
  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
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
  dummyMarketplaceData,
  renderItem,
}) => {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dummyMarketplaceData.filter((it) => {
      const matchesCategory =
        selectedCategory === "All" || it.category === selectedCategory;
      const matchesQuery =
        q === "" ||
        it.name.toLowerCase().includes(q) ||
        it.seller.toLowerCase().includes(q) ||
        (it.location || "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory, dummyMarketplaceData]);

  return <MarketplaceTabContent items={filtered} renderItem={renderItem} />;
};

const FreeItemsTab: FC<MarketplaceTabsProps> = ({
  query,
  selectedCategory,
  dummyMarketplaceData,
  renderItem,
}) => {
  const freeItems = useMemo(() => {
    return dummyMarketplaceData.filter((item) => item.price === 0);
  }, [dummyMarketplaceData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return freeItems.filter((it) => {
      const matchesCategory =
        selectedCategory === "All" || it.category === selectedCategory;
      const matchesQuery =
        q === "" ||
        it.name.toLowerCase().includes(q) ||
        it.seller.toLowerCase().includes(q) ||
        (it.location || "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory, freeItems]);

  return (
    <MarketplaceTabContent
      items={filtered}
      renderItem={renderItem}
      emptyMessage="No free items found."
    />
  );
};

const NearbyTab: FC<MarketplaceTabsProps> = ({
  query,
  selectedCategory,
  dummyMarketplaceData,
  renderItem,
}) => {
  const nearbyItems = useMemo(() => {
    const nearbyLocations = [
      "Gelugor",
      "Bayan Lepas",
      "Ayer Itam",
      "Jelutong",
      "Bukit Mertajam",
      "George Town",
      "Butterworth",
      "Tanjung Bungah",
      "Seberang Jaya",
      "Bayan Baru",
      "Balik Pulau",
      "USM Gelugor",
    ];
    return dummyMarketplaceData.filter((item) =>
      nearbyLocations.includes(item.location || "")
    );
  }, [dummyMarketplaceData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return nearbyItems.filter((it) => {
      const matchesCategory =
        selectedCategory === "All" || it.category === selectedCategory;
      const matchesQuery =
        q === "" ||
        it.name.toLowerCase().includes(q) ||
        it.seller.toLowerCase().includes(q) ||
        (it.location || "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory, nearbyItems]);

  return <MarketplaceTabContent items={filtered} renderItem={renderItem} />;
};

const ForMeTab: FC<MarketplaceTabsProps> = ({
  query,
  selectedCategory,
  dummyMarketplaceData,
  renderItem,
}) => {
  const forMeItems = useMemo(() => {
    const shuffled = [...dummyMarketplaceData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.ceil(dummyMarketplaceData.length * 0.7));
  }, [dummyMarketplaceData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return forMeItems.filter((it) => {
      const matchesCategory =
        selectedCategory === "All" || it.category === selectedCategory;
      const matchesQuery =
        q === "" ||
        it.name.toLowerCase().includes(q) ||
        it.seller.toLowerCase().includes(q) ||
        (it.location || "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory, forMeItems]);

  return <MarketplaceTabContent items={filtered} renderItem={renderItem} />;
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
