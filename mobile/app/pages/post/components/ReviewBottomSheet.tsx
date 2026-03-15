import { submitReview } from "@/lib/api/reviews";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SooBottomSheet } from "@/components/SooBottomSheetController";
import AlertModal from "@/components/AlertModal";

interface ReviewBottomSheetProps {
  transactionId: string;
  reviewerId: string;
  revieweeId: string;
  onReviewSubmitted: () => void;
}

const ReviewBottomSheet: React.FC<ReviewBottomSheetProps> = ({
  transactionId,
  reviewerId,
  revieweeId,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitReview({
        transaction_id: transactionId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating,
        comment,
      });
      SooBottomSheet.pop(); // Close review sheet
      setTimeout(() => {
        SooBottomSheet.push({
          child: (
            <AlertModal
              title={"Review Submitted"}
              description="Your review has been submitted successfully."
              status="success"
              onClose={() => SooBottomSheet.pop()}
            />
          ),
        });
      }, 500);
      onReviewSubmitted();
    } catch (error) {
      console.error("Submit review error:", error);
      Alert.alert("Error", "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="px-4 pb-8">
      <Text className="text-lg font-bold text-center mb-4">
        Rate your experience
      </Text>

      <View className="flex-row justify-center mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            className="mx-2"
          >
            <MaterialIcons
              name={star <= rating ? "star" : "star-border"}
              size={40}
              color={star <= rating ? "#FBBF24" : "#D1D5DB"}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-sm font-medium mb-2 text-gray-700">
        Comments (Optional)
      </Text>
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-3 h-24 mb-6 text-base"
        placeholder="How was your experience?"
        multiline
        textAlignVertical="top"
        value={comment}
        onChangeText={setComment}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting || rating === 0}
        className={`w-full py-4 rounded-full items-center ${
          submitting || rating === 0 ? "bg-gray-300" : "bg-black"
        }`}
      >
        {submitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-base">Submit Review</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ReviewBottomSheet;
