import CategoryBottomSheet from "@/app/pages/home/components/CategoryBottomSheet";
import { SooBottomSheet } from "@/components/SooBottomSheetController";
import { submitReport, uploadReportImage } from "@/lib/api/api";
import { Report } from "@/lib/api/apiModel";
import { wasteTypes } from "@/lib/constants/commonConst";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapBottomSheet from "./MapBottomSheet";
import WasteTypeGuideBottomSheet from "./WasteTypeGuideBottomSheet";
import AlertModal from "@/components/AlertModal";

const MAX_PHOTO_AGE_MS = 24 * 60 * 60 * 1000;
const SAME_PHOTO_CAPTURE_TIME_TOLERANCE_MS = 1000;
const SAME_PHOTO_MIN_SIZE_TOLERANCE_BYTES = 12 * 1024;
const SAME_PHOTO_SIZE_TOLERANCE_RATIO = 0.08;

type ReportPhoto = {
  uri: string;
  capturedAt: string;
  assetId?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  width?: number;
  height?: number;
};

const SubmitReportTab: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [coordinate, setCoordinate] = useState<
    { latitude: number; longitude: number } | undefined
  >(undefined);
  const [photos, setPhotos] = useState<ReportPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const setHasOpenedPicker = useUserStore((s) => s.setHasOpenedPicker);
  const parseExifDate = (value: unknown): Date | null => {
    if (typeof value !== "string" || !value.trim()) {
      return null;
    }

    const normalized = value.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const extractCapturedAtFromExif = (
    exif?: ImagePicker.ImagePickerAsset["exif"],
  ) => {
    if (!exif) return null;

    const exifDate =
      parseExifDate(exif.DateTimeOriginal) ||
      parseExifDate(exif.DateTimeDigitized) ||
      parseExifDate(exif.DateTime);

    return exifDate;
  };

  const isPhotoWithin24Hours = (capturedAt: string) => {
    const capturedAtMs = new Date(capturedAt).getTime();

    if (Number.isNaN(capturedAtMs)) {
      return false;
    }

    const ageMs = Date.now() - capturedAtMs;
    return ageMs >= 0 && ageMs <= MAX_PHOTO_AGE_MS;
  };

  const showAlertSheet = ({
    title,
    description,
    confirmText = "Done",
    status = "failed",
    onConfirm,
    isDismissible = true,
    needCloseButton = true,
  }: {
    title: string;
    description: string;
    confirmText?: string;
    status?: "success" | "failed";
    onConfirm?: () => void;
    isDismissible?: boolean;
    needCloseButton?: boolean;
  }) => {
    SooBottomSheet.push({
      title: "",
      needPadding: false,
      isDismissible,
      needCloseButton,
      child: (
        <AlertModal
          title={title}
          description={description}
          status={status}
          confirmText={confirmText}
          onClose={() => {
            SooBottomSheet.pop();
            onConfirm?.();
          }}
        />
      ),
    });
  };

  const buildPhotoFingerprint = (photo: ReportPhoto) => {
    if (photo.assetId) {
      return `asset:${photo.assetId}`;
    }

    const dimension = `${photo.width ?? "?"}x${photo.height ?? "?"}`;
    const capturedAtMs = new Date(photo.capturedAt).getTime();
    const capturedAtToken = Number.isNaN(capturedAtMs)
      ? photo.capturedAt
      : capturedAtMs.toString();
    return `${dimension}|${capturedAtToken}`;
  };

  const arePhotosLikelySame = (first: ReportPhoto, second: ReportPhoto) => {
    if (first.assetId && second.assetId && first.assetId === second.assetId) {
      return true;
    }

    const firstCapturedAtMs = new Date(first.capturedAt).getTime();
    const secondCapturedAtMs = new Date(second.capturedAt).getTime();
    const hasCapturedAt =
      !Number.isNaN(firstCapturedAtMs) && !Number.isNaN(secondCapturedAtMs);
    const sameCapturedAt =
      hasCapturedAt &&
      Math.abs(firstCapturedAtMs - secondCapturedAtMs) <=
        SAME_PHOTO_CAPTURE_TIME_TOLERANCE_MS;

    const hasDimensions =
      typeof first.width === "number" &&
      typeof first.height === "number" &&
      typeof second.width === "number" &&
      typeof second.height === "number";
    const sameDimensions =
      hasDimensions &&
      first.width === second.width &&
      first.height === second.height;

    const firstFileSize =
      typeof first.fileSize === "number" ? first.fileSize : null;
    const secondFileSize =
      typeof second.fileSize === "number" ? second.fileSize : null;
    const hasFileSize = firstFileSize !== null && secondFileSize !== null;
    const sameFileSizeWithinTolerance =
      hasFileSize &&
      Math.abs(firstFileSize - secondFileSize) <=
        Math.max(
          SAME_PHOTO_MIN_SIZE_TOLERANCE_BYTES,
          Math.round(
            Math.max(firstFileSize, secondFileSize) *
              SAME_PHOTO_SIZE_TOLERANCE_RATIO,
          ),
        );

    if (
      sameCapturedAt &&
      sameDimensions &&
      (!hasFileSize || sameFileSizeWithinTolerance)
    ) {
      return true;
    }

    return buildPhotoFingerprint(first) === buildPhotoFingerprint(second);
  };

  const handleSubmit = async () => {
    const normalizedLocation = location.trim();
    const normalizedDescription = description.trim();
    const normalizedType = selectedType.trim();

    if (!normalizedLocation) {
      showAlertSheet({
        title: "Location required",
        description: "Please select a valid location before submitting.",
      });
      return;
    }

    if (!normalizedType || !wasteTypes.includes(normalizedType)) {
      showAlertSheet({
        title: "Waste type required",
        description: "Please select a valid waste type from the list.",
      });
      return;
    }

    if (!normalizedDescription) {
      showAlertSheet({
        title: "Description required",
        description: "Please provide a short description of the issue.",
      });
      return;
    }

    if (photos.length === 0) {
      showAlertSheet({
        title: "Photo required",
        description: "Please attach at least one photo before submitting.",
      });
      return;
    }

    if (
      coordinate &&
      (!Number.isFinite(coordinate.latitude) ||
        !Number.isFinite(coordinate.longitude))
    ) {
      showAlertSheet({
        title: "Invalid location",
        description: "Selected map coordinates are invalid. Please reselect.",
      });
      return;
    }

    const hasInvalidPhotoInput = photos.some(
      (photo) =>
        typeof photo.uri !== "string" ||
        !photo.uri.trim() ||
        typeof photo.capturedAt !== "string" ||
        Number.isNaN(new Date(photo.capturedAt).getTime()),
    );
    if (hasInvalidPhotoInput) {
      showAlertSheet({
        title: "Invalid photo",
        description: "One or more photos are invalid. Please re-add them.",
      });
      return;
    }

    const hasExpiredPhoto = photos.some(
      (photo) => !isPhotoWithin24Hours(photo.capturedAt),
    );
    if (hasExpiredPhoto) {
      showAlertSheet({
        title: "Photo too old",
        description:
          "All photos must be captured within the last 24 hours. Please retake your photos and try again.",
      });
      return;
    }

    setLoading(true);
    try {
      const uploadedImageUrls: string[] = [];
      if (photos.length > 0) {
        for (const photo of photos) {
          const url = await uploadReportImage(user?.id, photo.uri);
          uploadedImageUrls.push(url);
        }
      }

      const reportData: Omit<Report, "id" | "status" | "created_at"> = {
        user_id: user?.id ?? null,
        location: normalizedLocation,
        latitude:
          typeof coordinate?.latitude === "number" &&
          Number.isFinite(coordinate.latitude)
            ? coordinate.latitude
            : null,
        longitude:
          typeof coordinate?.longitude === "number" &&
          Number.isFinite(coordinate.longitude)
            ? coordinate.longitude
            : null,
        description: normalizedDescription,
        type: normalizedType,
        images: uploadedImageUrls,
      };

      await submitReport(reportData);

      SooBottomSheet.push({
        title: "",
        needPadding: false,
        isDismissible: false,
        needCloseButton: false,
        child: (
          <AlertModal
            title="Report Submitted!"
            description="Thank you for helping us keep the city clean. Your report has been successfully submitted and will be reviewed shortly."
            status="success"
            onClose={() => {
              setLocation("");
              setDescription("");
              setSelectedType("");
              setCoordinate(undefined);
              setPhotos([]);
              SooBottomSheet.pop();
            }}
          />
        ),
      });
    } catch (error) {
      console.error(error);
      showAlertSheet({
        title: "Error",
        description: "Failed to submit report. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled =
    loading ||
    !location.trim() ||
    !description.trim() ||
    !selectedType.trim() ||
    photos.length === 0;

  const onOpenMap = () => {
    Keyboard.dismiss();
    SooBottomSheet.push({
      title: "Select Location",
      needPadding: false,
      isDismissible: true,
      child: (
        <MapBottomSheet
          onSelectLocation={(coord, address) => {
            setCoordinate(coord);
            setLocation(address);
          }}
          initialLocation={coordinate}
        />
      ),
    });
  };

  const addPhoto = (photo: ReportPhoto) => {
    if (!isPhotoWithin24Hours(photo.capturedAt)) {
      showAlertSheet({
        title: "Photo too old",
        description: "Only photos captured in the last 24 hours are accepted.",
      });
      return;
    }

    setPhotos((currentPhotos) => {
      if (
        currentPhotos.some((existingPhoto) =>
          arePhotosLikelySame(existingPhoto, photo),
        )
      ) {
        showAlertSheet({
          title: "Duplicate photo",
          description: "This photo has already been selected.",
        });
        return currentPhotos;
      }
      return [...currentPhotos, photo];
    });
  };

  const capturePhoto = async () => {
    setHasOpenedPicker(true);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showAlertSheet({
        title: "Permission required",
        description: "Please allow access to your camera.",
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      exif: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const capturedAt =
        extractCapturedAtFromExif(asset.exif)?.toISOString() ||
        new Date().toISOString();
      addPhoto({
        uri: asset.uri,
        capturedAt,
        assetId: asset.assetId,
        fileName: asset.fileName,
        fileSize: asset.fileSize,
        width: asset.width,
        height: asset.height,
      });
    }
  };

  const pickPhotoFromGallery = async () => {
    setHasOpenedPicker(true);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showAlertSheet({
        title: "Permission required",
        description: "Please allow access to your photo library.",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      exif: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const capturedAt = extractCapturedAtFromExif(asset.exif);

      if (!capturedAt) {
        showAlertSheet({
          title: "Timestamp required",
          description:
            "This gallery photo has no EXIF capture timestamp. Please capture the waste using your camera.",
          confirmText: "Open Camera",
          onConfirm: () => {
            setTimeout(() => {
              void capturePhoto();
            }, 200);
          },
        });
        return;
      }

      addPhoto({
        uri: asset.uri,
        capturedAt: capturedAt.toISOString(),
        assetId: asset.assetId,
        fileName: asset.fileName,
        fileSize: asset.fileSize,
        width: asset.width,
        height: asset.height,
      });
    }
  };

  const openPhotoSourcePicker = () => {
    Keyboard.dismiss();
    SooBottomSheet.push({
      title: "Add Photo",
      needPadding: false,
      child: (
        <View className="px-6 pb-8">
          <Text className="text-sm text-gray-500 mb-4">
            Choose a source for your report photo.
          </Text>
          <TouchableOpacity
            onPress={() => {
              SooBottomSheet.pop();
              void capturePhoto();
            }}
            className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border border-gray-100 mb-3"
          >
            <View className="w-10 h-10 rounded-full bg-black items-center justify-center">
              <MaterialIcons name="photo-camera" size={20} color="#fff" />
            </View>
            <View className="ml-3">
              <Text className="text-base font-semibold text-black">Camera</Text>
              <Text className="text-xs text-gray-500">
                Capture a new photo now
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              SooBottomSheet.pop();
              void pickPhotoFromGallery();
            }}
            className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border border-gray-100"
          >
            <View className="w-10 h-10 rounded-full bg-black items-center justify-center">
              <MaterialIcons name="photo-library" size={20} color="#fff" />
            </View>
            <View className="ml-3">
              <Text className="text-base font-semibold text-black">
                Gallery
              </Text>
              <Text className="text-xs text-gray-500">
                Pick an existing photo
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      ),
    });
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const onWasteTypeClicked = () => {
    Keyboard.dismiss();
    SooBottomSheet.push({
      title: "Select Waste Type",
      needPadding: false,
      child: (
        <CategoryBottomSheet
          category={wasteTypes}
          selectedCategory={selectedType}
          setSelectedCategoryCallback={(type) => {
            setSelectedType(type);
            SooBottomSheet.pop();
          }}
        />
      ),
    });
  };

  const onOpenWasteTypeManual = () => {
    Keyboard.dismiss();
    SooBottomSheet.push({
      title: "Waste Type Manual",
      needPadding: false,
      child: <WasteTypeGuideBottomSheet />,
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
    >
      <View className="px-6 py-6 pb-10">
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Location
          </Text>
          <View className="flex-row items-center gap-2 mb-2">
            <TouchableOpacity
              className="flex-1 flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
              onPress={onOpenMap}
            >
              <MaterialIcons name="map" size={20} color="#000" />
              <Text className="ml-2 text-black flex-1" numberOfLines={1}>
                {location || "Select location on map"}
              </Text>
              <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-medium text-gray-700">
              Waste Type
            </Text>
            <TouchableOpacity
              onPress={onOpenWasteTypeManual}
              className="flex-row items-center bg-gray-100 rounded-full px-3 py-1.5"
            >
              <MaterialIcons name="menu-book" size={14} color="#374151" />
              <Text className="text-xs font-medium text-gray-700 ml-1">
                View Manual
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
            onPress={onWasteTypeClicked}
          >
            <Text
              className={`flex-1 ${selectedType ? "text-black" : "text-gray-400"}`}
            >
              {selectedType || "Select waste type"}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <Text className="text-xs text-gray-500 mt-2">
            Not sure which type to choose? Use the manual for examples and
            exclusions.
          </Text>
        </View>
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Description
          </Text>
          <View className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 h-32">
            <TextInput
              className="flex-1 text-lg font-normal text-black"
              placeholder="Describe the issue..."
              placeholderTextColor="#888"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Add Photos
          </Text>
          <Text className="text-xs text-gray-500 mb-2">
            Only photos captured within the last 24 hours are accepted.
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              onPress={openPhotoSourcePicker}
              className="w-24 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center mr-3"
            >
              <View className="w-8 h-8 rounded-full bg-black items-center justify-center">
                <MaterialIcons name="add" size={20} color="#fff" />
              </View>
              <Text className="text-xs text-gray-700 mt-2 font-medium">
                Add Photo
              </Text>
            </TouchableOpacity>
            {photos.map((photo, index) => (
              <View key={index} className="relative mr-3">
                <Image
                  source={{ uri: photo.uri }}
                  className="w-24 h-24 rounded-xl"
                />
                <TouchableOpacity
                  onPress={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                >
                  <MaterialIcons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          className={`bg-black py-4 rounded-full items-center shadow-lg ${
            isSubmitDisabled ? "opacity-60" : ""
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Submit Report</Text>
          )}
        </TouchableOpacity>
      </View>
      <View className="h-48" />
    </ScrollView>
  );
};

export default SubmitReportTab;
