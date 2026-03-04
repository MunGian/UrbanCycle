import React from "react";
import { Text } from "react-native";

interface EmphasizedTextProps {
  /** The full text, use <em>...</em> to mark emphasized sections */
  text: string;
  /** Tailwind class for overall text */
  className?: string;
  /** Optional Tailwind classes for emphasized text */
  emClassName?: string;
  /** Callback when emphasized text is pressed */
  onEmphasizedPress?: (emText: string) => void;
}

const EmphasizedText: React.FC<EmphasizedTextProps> = ({
  text = "",
  className = "",
  emClassName = "",
  onEmphasizedPress = () => {},
}) => {
  const parts = text.split(/(<em>.*?<\/em>)/g);
  return (
    <Text className={className}>
      {parts.map((part, index) => {
        const match = part.match(/<em>(.*?)<\/em>/);
        if (match) {
          const emphasizedText = match[1];
          return (
            <Text
              key={index}
              className={emClassName}
              onPress={() => onEmphasizedPress(emphasizedText)}
            >
              {emphasizedText}
            </Text>
          );
        }
        return <Text key={index}>{part}</Text>;
      })}
    </Text>
  );
};

export default EmphasizedText;
