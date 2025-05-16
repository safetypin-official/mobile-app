import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ReplyBannerProps {
  username: string;
  onCancel: () => void;
}

const ReplyBanner: React.FC<ReplyBannerProps> = ({ username, onCancel }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Replying to <Text style={styles.username}>{username}</Text></Text>
      <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
        <Text style={styles.cancelText}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  text: {
    fontSize: 14,
    color: '#666',
  },
  username: {
    fontWeight: 'bold',
    color: '#4D4544',
  },
  cancelButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
});

export default ReplyBanner;