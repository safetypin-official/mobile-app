import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import Button from "@/components/buttons/Button";
import InputField from "@/components/inputs/InputField";
import * as ImagePicker from "expo-image-picker";

interface PostFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (post: {
    title: string;
    description: string;
    tags: string[];
    images: string[];
  }) => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

const PostForm: React.FC<PostFormProps> = ({ visible, onClose, onSubmit }) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSubmit = () => {
    onSubmit({
      title,
      description,
      tags: selectedTags,
      images,
    });
    onClose();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ScrollView style={styles.scrollView}
      contentContainerStyle={{ flexGrow: 1 }} // Add this
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Image
              source={{
                uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/6daccf7530658cf411e811c7b28e77cc9bd6214a3cf22bd6223242420a7f0c26?placeholderIfAbsent=true",
              }}
              style={styles.headerIcon}
            />
            <Text style={styles.headerTitle}>New Report</Text>
          </View>
          <View style={styles.buttonView}>
            <Button children="Post" onPress={handleSubmit} />
          </View>
        </View>

        <View style={styles.formContent}>
          <Text style={styles.label}>Location</Text>
          <Image
            source={{
              uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/c66dc0c16a0f75ad840ea97ab975535c35d7719a687cf833cfe8f05f96b67da9?placeholderIfAbsent=true",
            }}
            style={styles.locationImage}
          />

          <InputField
            label="Title"
            labelColor="rgba(59, 8, 10, 1)"
            placeholder="Title"
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagsContainer}>
            <TouchableOpacity
              style={[
                styles.tagButton,
                selectedTags.includes("Lost Item") && styles.tagButtonSelected,
              ]}
              onPress={() => toggleTag("Lost Item")}
            >
              <Image
                source={{
                  uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/f31eb8e482f9ed75e8725402beba20d7abf4adccd40da9b6166c7a27f2523687?placeholderIfAbsent=true",
                }}
                style={styles.tagIcon}
              />
              <Text style={styles.tagText}>Lost Item</Text>
            </TouchableOpacity>
          </View>

          <InputField
            label="Description"
            labelColor="rgba(59, 8, 10, 1)"
            placeholder="Describe what happened here..."
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Attachments</Text>
          <TouchableOpacity style={styles.attachmentArea} onPress={pickImage}>
            <Text style={styles.attachmentText}>Attach photos here.</Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              {images.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  style={styles.imagePreview}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  buttonView: {
    width: "auto",
  },
  container: {
    // position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SCREEN_HEIGHT,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  headerIcon: {
    width: 22,
    height: 22,
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: 32,
    color: "rgba(59, 8, 10, 1)",
  },
  postButton: {
    backgroundColor: "#7B241C",
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 20,
  },
  postButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  formContent: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    color: "rgba(59, 8, 10, 1)",
    fontWeight: "bold",
    marginBottom: 12,
  },
  locationImage: {
    width: "100%",
    height: 150,
    borderRadius: 16,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tagButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8D6D4",
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 20,
    gap: 4,
  },
  tagButtonSelected: {
    backgroundColor: "#7B241C",
  },
  tagIcon: {
    width: 16,
    height: 15,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  attachmentArea: {
    borderWidth: 2,
    borderColor: "#E8D6D4",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentText: {
    color: "#904A47",
    fontSize: 16,
  },
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});

export default PostForm;
