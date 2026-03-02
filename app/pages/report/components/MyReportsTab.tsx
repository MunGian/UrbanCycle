import { AuthPlaceholder } from "@/components/AuthPlaceholder";
import { fetchUserReports } from "@/lib/api/api";
import { Report } from "@/lib/api/apiModel";
import { formatLocalDateTime } from "@/lib/constants/commonConst";
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
  const { width } = Dimensions.get("window");

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
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-6 py-6 pb-10">
          {reports.map((report) => (
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
          {reports.length === 0 && (
            <View className="items-center justify-center py-20">
              <MaterialIcons name="history" size={64} color="#E5E7EB" />
              <Text className="text-gray-400 mt-4">No reports yet</Text>
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
