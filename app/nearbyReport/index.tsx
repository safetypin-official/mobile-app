import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import UserInfo from "../../components/displays/UserInfo";
import ReportContent from "../../components/displays/ReportContent";
import CommentSection from "../../components/displays/CommentSection";
import CommentInput from "../../components/inputs/CommentInput";

const NearbyReport: React.FC = () => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollableContent}>
        <View style={styles.mainContent}>
          <View style={styles.contentWrapper}>
            <UserInfo
              avatarUrl="https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/f806fe330fa9f5d6235dca1cb075682ea60ceeeafa74088633aa747789bbf602?placeholderIfAbsent=true"
              username="Mimi"
              handle="@mimemamomu"
              date="Feb 11"
              location="Morioh-Cho"
              locationIconUrl="https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/efa751268393d995d15a860d9a0abb73606aed401a38a421bcbfdda2c788670a?placeholderIfAbsent=true"
              moreOptionsIconUrl="https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/43f6a47c22e1c702925915e6626ae6f483d1e56e047a9647d4ff9e5de9751425?placeholderIfAbsent=true"
              longitude={123}
              latitude={123}
            />

            <ReportContent
              title="Title"
              content="My name is Yoshikage Kira. I'm 33 years old. My house is in the northeast section of Morioh, where all the villas are, and I am not married. I work as an employee for the Kame Yu department stores, and I get home every day by 8 PM at the latest. I don't smoke, but I occasionally drink. I'm in bed by 11 PM, and make sure I get eight hours of sleep.."
              likeCount={100}
              dislikeCount={0}
              selectedTags={["Lost Item", "Flood"]}
            />

            <View style={styles.divider} />

            <CommentSection
              avatarUrl="https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/181302be7ced1fc2a116ef1ab8f3425861b606566df33e6446ca151b2b0bd2ec?placeholderIfAbsent=true"
              username="Mumu"
              handle="@mamomu"
              date="Feb 15"
              content="Hey i think i saw this item when i passed by the next road!"
              likeCount={20}
              likeIconUrl="https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/786db80d954d3ed1a2aecc12f45e5d3c04051c91d0cd1e5d7f2d12fb5e3826ff?placeholderIfAbsent=true"
              moreOptionsIconUrl="https://cdn.builder.io/api/v1/image/assets/e66a0a8af3e84d7ea30c7aa6672d5e75/aac491af6aa991ca739f9f3ac08a245fa7f6ef6e3fcb3bcf13d72a482f14f0a9?placeholderIfAbsent=true"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.commentInputWrapper}>
        <CommentInput />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEFEFE",
    marginBottom: 0
  },
  scrollableContent: {
    flex: 1,
    paddingBottom: 120,
  },
  tagsContainer: {
    margin: 10
  },
  mainContent: {
    flex: 1,
    width: "100%",
    marginTop: 29,
    paddingHorizontal: 24,
  },
  contentWrapper: {
    flexDirection: "column",
    width: "100%",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  commentInputWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    backgroundColor: "#FEFEFE",
    zIndex: 10,
    paddingVertical: 10,
  },
});

export default NearbyReport;