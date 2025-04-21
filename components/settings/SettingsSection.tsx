import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SettingsItem, { SettingsItemProps } from '@/components/settings/SettingsItem';

interface SettingsSectionProps {
  title: string;
  items: SettingsItemProps[];
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, items }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{title}</Text>
      </View>
      {items.map((item) => (
        <SettingsItem 
          key={item.title}
          {...item} 
        />
      ))}
    </View>
  );
};

// Reuse your existing styles
const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginVertical: 8,
    width: '100%',
  },
  headerContainer: {
    alignSelf: 'stretch',
    width: '100%',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
});

export default SettingsSection;
