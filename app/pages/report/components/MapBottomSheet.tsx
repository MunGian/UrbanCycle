import { SooBottomSheet } from "@/components/SooBottomSheetController";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

interface MapBottomSheetProps {
  onSelectLocation: (
    coordinate: { latitude: number; longitude: number },
    address: string,
  ) => void;
  initialLocation?: { latitude: number; longitude: number };
}

const MapBottomSheet: React.FC<MapBottomSheetProps> = ({
  onSelectLocation,
  initialLocation,
}) => {
  const [region, setRegion] = useState<Region>({
    latitude: initialLocation?.latitude ?? 5.3553, // USM Penang
    longitude: initialLocation?.longitude ?? 100.3017,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [selectedCoordinate, setSelectedCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(initialLocation || null);
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<MapView>(null);
  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    if (!initialLocation) {
      getCurrentLocation();
    } else {
      const newRegion = {
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
      setSelectedCoordinate(initialLocation);
      reverseGeocode(initialLocation);
    }
  }, []);

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
      setSelectedCoordinate(location.coords);
      reverseGeocode(location.coords);
    } catch (error) {
      console.log("Error getting location", error);
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (coordinate: {
    latitude: number;
    longitude: number;
  }) => {
    try {
      const result = await Location.reverseGeocodeAsync(coordinate);
      if (result.length > 0) {
        const addr = result[0];
        const formattedAddress = `${addr.street || ""} ${addr.name || ""}, ${addr.city || ""}, ${addr.region || ""}`;
        setAddress(formattedAddress.trim().replace(/^,/, "").trim());
      }
    } catch (error) {
      console.log("Error reverse geocoding", error);
    }
  };

  const handleMapPress = (e: any) => {
    const coordinate = e.nativeEvent.coordinate;
    setSelectedCoordinate(coordinate);
    reverseGeocode(coordinate);
  };

  const handleConfirm = () => {
    if (selectedCoordinate) {
      onSelectLocation(selectedCoordinate, address);
      SooBottomSheet.pop();
    }
  };

  return (
    <View
      style={{ height: screenHeight * 0.67 }}
      className="bg-white w-full relative"
    >
      <MapView
        ref={mapRef}
        style={{ flex: 1, width: "100%", height: "100%" }}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
        // mapType="none"
      >
        {/* CartoDB Voyager Tiles (Free, Open Source)
        <UrlTile
          urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
          maximumZ={19}
          zIndex={1}
        /> */}
        {/* Marker for selected coordinate */}
        {selectedCoordinate && <Marker coordinate={selectedCoordinate} />}
      </MapView>

      {loading && (
        <View className="absolute top-1/2 left-1/2 -ml-5 -mt-5 z-20">
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}

      <TouchableOpacity
        className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-md z-10"
        onPress={getCurrentLocation}
        style={{ elevation: 5 }}
      >
        <MaterialIcons name="my-location" size={24} color="black" />
      </TouchableOpacity>

      <View
        className="absolute bottom-8 left-4 right-4 bg-white p-4 rounded-xl shadow-sm z-10"
        style={{ elevation: 3 }}
      >
        <Text className="text-sm text-gray-500 mb-1">Selected Address:</Text>
        <Text className="text-base font-medium text-black">
          {address || "Tap on map to select"}
        </Text>

        <TouchableOpacity
          className="mt-4 bg-black py-3 rounded-full items-center"
          onPress={handleConfirm}
        >
          <Text className="text-white font-bold text-lg">Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MapBottomSheet;
