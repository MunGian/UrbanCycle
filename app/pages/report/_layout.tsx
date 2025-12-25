import { AuthPlaceholder } from "@/components/AuthPlaceholder";
import { Report } from "@/lib/api/apiModel";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ReportPage: React.FC = () => {
  const user = useUserStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<"submit" | "history">("submit");

  // Form State
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // Dummy History Data
  const [reports, setReports] = useState<Report[]>([
    {
      id: "1",
      location: "Jalan Tun Razak, near bus stop",
      description: "Overflowing bin with plastic waste",
      type: "General",
      status: "Pending",
      date: "2023-10-25",
    },
    {
      id: "2",
      location: "Taman Tasik Titiwangsa",
      description: "Fallen tree branch blocking path",
      type: "Green Waste",
      status: "Resolved",
      date: "2023-10-20",
    },
  ]);

  const wasteTypes = [
    "General",
    "Recyclable",
    "Hazardous",
    "Green Waste",
    "Construction",
  ];

  const handleSubmit = () => {
    // Mock submission
    const newReport: Report = {
      id: Date.now().toString(),
      location: location || "Unknown Location",
      description: description || "No description provided",
      type: selectedType || "General",
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
    };
    setReports([newReport, ...reports]);
    setActiveTab("history");
    // Reset form
    setLocation("");
    setDescription("");
    setSelectedType("");
  };

  return (
    <View className="flex h-full w-full bg-white">
      {/* Header */}
      <View className="px-6 pt-6 pb-4 bg-white">
        <Text className="text-2xl font-bold text-black">Waste Reporting</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 mb-6">
        <TouchableOpacity
          onPress={() => setActiveTab("submit")}
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "submit" ? "border-black" : "border-transparent"
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === "submit" ? "text-black" : "text-gray-400"
            }`}
          >
            Submit Report
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("history")}
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === "history" ? "border-black" : "border-transparent"
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === "history" ? "text-black" : "text-gray-400"
            }`}
          >
            My Reports
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 mb-24" showsVerticalScrollIndicator={false}>
        {activeTab === "submit" ? (
          <View className="px-6 pb-10">
            {/* Location Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Location
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <MaterialIcons name="location-on" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-2 text-black"
                  placeholder="Enter location or landmark"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>

            {/* Waste Type */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Waste Type
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {wasteTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-full border ${
                      selectedType === type
                        ? "bg-black border-black"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={
                        selectedType === type ? "text-white" : "text-gray-600"
                      }
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Description
              </Text>
              <View className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 h-32">
                <TextInput
                  className="flex-1 text-black text-top"
                  placeholder="Describe the issue..."
                  multiline
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

            {/* Photo Upload */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Add Photo
              </Text>
              <TouchableOpacity className="h-40 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center">
                <MaterialIcons name="add-a-photo" size={32} color="#9CA3AF" />
                <Text className="text-gray-400 mt-2">Tap to upload photo</Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-black py-4 rounded-full items-center shadow-md"
            >
              <Text className="text-white font-bold text-lg">
                Submit Report
              </Text>
            </TouchableOpacity>
          </View>
        ) : !user ? (
          <View className="mt-20 justify-center items-center">
            <AuthPlaceholder />
          </View>
        ) : (
          <View className="px-6 pb-10">
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

                <Text className="text-lg font-bold text-black mb-1">
                  {report.location}
                </Text>
                <Text className="text-gray-600 text-sm mb-3">
                  {report.description}
                </Text>

                <View className="flex-row items-center border-t border-gray-50 pt-3">
                  <MaterialIcons name="access-time" size={14} color="#9CA3AF" />
                  <Text className="text-gray-400 text-xs ml-1">
                    Reported on {report.date}
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
        )}
      </ScrollView>
    </View>
  );
};

export default ReportPage;
