import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from "react-native";
// Add this import for SVG
import Svg, { Path } from "react-native-svg";

interface CommentInputProps {
  onSubmit?: (comment: string) => void;
  maxLength?: number;
}

const CommentInput: React.FC<CommentInputProps> = ({ onSubmit, maxLength = 500 }) => {
  const [comment, setComment] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [inputHeight, setInputHeight] = useState<number>(40);

  const MIN_HEIGHT = 40;
  const MAX_HEIGHT = 120;

  const handleSubmit = () => {
    if (!comment.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    if (comment.length > maxLength) {
      setError(`Comment must be less than ${maxLength} characters`);
      return;
    }

    setError("");
    onSubmit?.(comment);
    setComment("");
    setInputHeight(MIN_HEIGHT);
  };

  const handleChangeText = (text: string) => {
    setComment(text);
    if (error) setError("");

    if (text.trim() === "") {
      setInputHeight(MIN_HEIGHT);
    }
  };

  return (
    <View testID="keyboard-avoiding-wrapper">
    <KeyboardAvoidingView
      testID="keyboard-avoiding-view"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.frameParent}>
        <View style={styles.frameGroup}>
          <View style={styles.textInputContainer}>
            <TextInput
              style={[styles.textInput, { height: Math.min(inputHeight, MAX_HEIGHT) }]}
              placeholder="Post a Comment"
              value={comment}
              onChangeText={handleChangeText}
              multiline
              onContentSizeChange={(event) =>
                setInputHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, event.nativeEvent.contentSize.height)))
              }
              scrollEnabled={false}
              underlineColorAndroid="transparent"
            />
          </View>

          <TouchableOpacity onPress={handleSubmit} testID="submit-button">
            <Svg width="40" height="40" viewBox="0 0 29 30" fill="none">
              <Path
                d="M2.43372 15.017C2.43372 8.34342 7.84367 2.93372 14.517 2.93372C21.1904 2.93372 26.6004 8.34342 26.6004 15.017C26.6004 21.6907 21.1904 27.1004 14.517 27.1004C7.84367 27.1004 2.43372 21.6907 2.43372 15.017ZM4.85038 15.017C4.85038 20.3555 9.17827 24.6837 14.517 24.6837C19.8558 24.6837 24.1836 20.3555 24.1837 15.017C24.1837 9.67863 19.8558 5.35038 14.517 5.35038C9.17827 5.35038 4.8505 9.67863 4.85038 15.017ZM8.47538 15.017C8.47538 14.35 9.01635 13.8087 9.68372 13.8087H16.4051L13.6485 11.0525L15.3855 9.31493L20.2188 14.1483C20.6908 14.6207 20.6908 15.4134 20.2188 15.8858L15.3855 20.7192L13.6485 18.9816L16.4051 16.2254H9.68372C9.01635 16.2254 8.47526 15.684 8.47538 15.017Z"
                fill="#9F3F3D"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "flex-end",
  },
  frameParent: {
    width: "100%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#775654",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    padding: 12,
  },
  frameGroup: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderWidth: 0,
    borderColor: "#775654",
    borderRadius: 0,
    padding: 10,
    fontSize: 14,
    fontWeight: "500",
    color: "#775654",
    backgroundColor: "#FFFFFF",
    textAlignVertical: "top",
  },
  arrowRightCircleIcon: {
    width: 40,
    height: 40,
    marginLeft: 10,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 5,
  },
});

export default CommentInput;