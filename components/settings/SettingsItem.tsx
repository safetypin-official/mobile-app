import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export interface SettingsItemProps {
  title: string;
  onPress: () => void;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.textContainer}>
        <Text>{title}</Text>
      </View>
      <Image
        accessibilityLabel="Arrow icon"
        source={{ uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/4e94a9cc5bc0a464551df601c9f55f59461fe597?apiKey=3d252c2866cb40ed8f1b49e6bfb91bab&" }}
        style={styles.image}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
        width: '100%',
        minHeight: 40,
    },
    textContainer: {
        alignSelf: 'stretch',
    },
    image: {
        flexShrink: 0,
        alignSelf: 'stretch',
        width: 8,
        aspectRatio: 0.57,
    },
});

export default SettingsItem;
