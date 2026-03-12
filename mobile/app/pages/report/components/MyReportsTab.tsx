import OptionBottomSheet from "@/app/pages/post/components/OptionBottomSheet";
import { AuthPlaceholder } from "@/components/AuthPlaceholder";
import { SooBottomSheet } from "@/components/SooBottomSheetController";
import { fetchUserReports } from "@/lib/api/api";
import { Report } from "@/lib/api/apiModel";
import {
  formatLocalDateTime,
  penangLocations,
  wasteTypes,
} from "@/lib/constants/commonConst";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MyReportsTab: React.FC = () => {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const { width } = Dimensions.get("window");

  const openStatusFilter = () => {
    const options = ["All", "Pending", "In Progress", "Resolved"].map((s) => ({
      label: s,
      value: s,
    }));

    SooBottomSheet.push({
      title: "Filter by Status",
      isDismissible: true,
      needPadding: false,
      child: (
        <OptionBottomSheet
          options={options}
          selectedValue={statusFilter}
          onSelect={(value) => {
            setStatusFilter(value);
          }}
          paddingBottom={20}
        />
      ),
    });
  };

  const openTypeFilter = () => {
    const options = ["All", ...wasteTypes].map((t) => ({
      label: t,
      value: t,
    }));

    SooBottomSheet.push({
      title: "Filter by Type",
      isDismissible: true,
      needPadding: false,
      child: (
        <OptionBottomSheet
          options={options}
          selectedValue={typeFilter}
          onSelect={(value) => {
            setTypeFilter(value);
          }}
          paddingBottom={20}
        />
      ),
    });
  };

  const openLocationFilter = () => {
    const options = ["All", ...penangLocations].map((l) => ({
      label: l,
      value: l,
    }));

    SooBottomSheet.push({
      title: "Filter by Location",
      isDismissible: true,
      needPadding: false,
      child: (
        <OptionBottomSheet
          options={options}
          selectedValue={locationFilter}
          onSelect={(value) => {
            setLocationFilter(value);
          }}
          paddingBottom={20}
        />
      ),
    });
  };

  const loadReports = useCallback(
    async (isRefresh = false) => {
      if (user) {
        if (!isRefresh) setLoading(true);
        try {
          const data = await fetchUserReports(user.id);
          setReports(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReports(true);
  }, [loadReports]);

  const openImageViewer = (images: string[]) => {
    if (images.length === 1) {
      setFullScreenImage(images[0]);
    } else if (images.length > 1) {
      router.push({
        pathname: "/pages/messageImageDetails",
        params: { images: JSON.stringify(images) },
      });
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesStatus =
      statusFilter === "All" || report.status === statusFilter;
    const matchesType = typeFilter === "All" || report.type === typeFilter;
    const matchesLocation =
      locationFilter === "All" || report.location.includes(locationFilter);
    return matchesStatus && matchesType && matchesLocation;
  });

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <AuthPlaceholder />
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="bg-white border-b border-gray-100">
        <View className="px-6 py-3 flex-row justify-between items-center">
          <Text className="text-gray-500 font-medium">
            {filteredReports.length}{" "}
            {filteredReports.length === 1 ? "Report" : "Reports"}
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-6 pb-3"
        >
          {/* Status Filter Chip */}
          <TouchableOpacity
            onPress={openStatusFilter}
            className={`mr-2 px-4 py-2 rounded-full border flex-row items-center ${
              statusFilter !== "All"
                ? "bg-black border-black"
                : "bg-white border-gray-200"
            }`}
          >
            <Text
              className={`font-medium text-sm mr-1 ${
                statusFilter !== "All" ? "text-white" : "text-gray-700"
              }`}
            >
              Status: {statusFilter}
            </Text>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={16}
              color={statusFilter !== "All" ? "white" : "#374151"}
            />
          </TouchableOpacity>

          {/* Type Filter Chip */}
          <TouchableOpacity
            onPress={openTypeFilter}
            className={`mr-2 px-4 py-2 rounded-full border flex-row items-center ${
              typeFilter !== "All"
                ? "bg-black border-black"
                : "bg-white border-gray-200"
            }`}
          >
            <Text
              className={`font-medium text-sm mr-1 ${
                typeFilter !== "All" ? "text-white" : "text-gray-700"
              }`}
              numberOfLines={1}
            >
              Type: {typeFilter}
            </Text>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={16}
              color={typeFilter !== "All" ? "white" : "#374151"}
            />
          </TouchableOpacity>

          {/* Location Filter Chip */}
          <TouchableOpacity
            onPress={openLocationFilter}
            className={`mr-6 px-4 py-2 rounded-full border flex-row items-center ${
              locationFilter !== "All"
                ? "bg-black border-black"
                : "bg-white border-gray-200"
            }`}
          >
            <Text
              className={`font-medium text-sm mr-1 ${
                locationFilter !== "All" ? "text-white" : "text-gray-700"
              }`}
              numberOfLines={1}
            >
              Location: {locationFilter}
            </Text>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={16}
              color={locationFilter !== "All" ? "white" : "#374151"}
            />
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-6 py-6 pb-10">
          {filteredReports.map((report) => (
            <View
              key={report.id}
              className="bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm"
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="bg-gray-100 px-2 py-1 rounded-md">
                  <Text className="text-xs font-medium text-gray-600">
                    {report.type}
                  </Text>
                </View>
                <View
                  className={`px-2 py-1 rounded-full ${
                    report.status === "Resolved"
                      ? "bg-green-100"
                      : report.status === "In Progress"
                        ? "bg-blue-100"
                        : "bg-yellow-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      report.status === "Resolved"
                        ? "text-green-700"
                        : report.status === "In Progress"
                          ? "text-blue-700"
                          : "text-yellow-700"
                    }`}
                  >
                    {report.status}
                  </Text>
                </View>
              </View>

              <Text className="text-base font-bold text-black mb-1">
                {report.location}
              </Text>
              <Text className="text-gray-600 text-sm mb-3">
                {report.description}
              </Text>

              {report.images && report.images.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-3"
                >
                  {report.images.map((img, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => openImageViewer(report.images!)}
                      className="mr-2"
                    >
                      <Image
                        source={{ uri: img }}
                        className="w-24 h-24 rounded-lg bg-gray-100"
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <View className="flex-row items-center border-t border-gray-50 pt-3">
                <MaterialIcons name="access-time" size={14} color="#81868f" />
                <Text className="text-gray-500 text-xs ml-1">
                  Reported on {formatLocalDateTime(report.created_at)}
                </Text>
              </View>
            </View>
          ))}
          {filteredReports.length === 0 && (
            <View className="items-center justify-center py-20">
              <MaterialIcons name="history" size={64} color="#E5E7EB" />
              <Text className="text-gray-400 mt-4">
                {reports.length === 0
                  ? "No reports yet"
                  : "No matching reports found"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal
        visible={!!fullScreenImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}
      >
        <View className="flex-1 bg-black justify-center items-center relative">
          <SafeAreaView className="absolute top-0 left-0 right-0 z-10">
            <TouchableOpacity
              className="p-4 items-start"
              onPress={() => setFullScreenImage(null)}
            >
              <MaterialIcons name="close" size={30} color="white" />
            </TouchableOpacity>
          </SafeAreaView>

          {fullScreenImage && (
            <Image
              source={{ uri: fullScreenImage }}
              style={{ width: width, height: "100%" }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default MyReportsTab;
