import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";

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
  const screenWidth = Dimensions.get("window").width;

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
    <KeyboardAvoidingView
      testID="keyboard-avoiding-view"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.frameParent}>
        <View style={styles.frameGroup}>
          <View style={styles.frameContainer}>
            <View style={styles.postACommentWrapper}>
              <TextInput
                style={[styles.textInput, { height: Math.min(inputHeight, MAX_HEIGHT), width: screenWidth * 0.85 }]}
                placeholder="Post a Comment"
                value={comment}
                onChangeText={handleChangeText}
                multiline
                onContentSizeChange={(event) =>
                    setInputHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, event.nativeEvent.contentSize.height)))
                }
                scrollEnabled = {false}
                underlineColorAndroid="transparent"
              />
            </View>
          </View>

          <TouchableOpacity onPress={handleSubmit} testID = "submit-button">
            <Image
              source={{
                uri: "https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/d0255cd433d63bce9715104a7a690c8844087fad7a86d1d0845d1284bada65f3?placeholderIfAbsent=true",
              }}
              style={styles.arrowRightCircleIcon}
            />
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </KeyboardAvoidingView>
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
    paddingVertical: 12,
  },
  frameGroup: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  frameContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  postACommentWrapper: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  textInput: {
    borderBottomWidth: 1,
    borderWidth: 0,
    borderColor: "#775654",
    borderRadius: 0,
    padding: 10,
    fontSize: 16,
    color: "#374151",
    backgroundColor: "#FFFFFF",
    textAlignVertical: "top",
  },
  frameChild: {
    alignSelf: "stretch",
    backgroundColor: "#775654",
    height: 1,
    marginTop: 5,
  },
  arrowRightCircleIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginLeft: 10,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 5,
  },
});

export default CommentInput;