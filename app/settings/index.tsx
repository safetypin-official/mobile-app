import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import SettingsSection from '@/components/settings/SettingsSection';
import Button from '@/components/buttons/Button';

export const accountItems = [
  { title: 'Change Password', onPress: () => {} },
  { title: 'Delete Account', onPress: () => {} },
];

export const helpItems = [
  { title: 'Submit Feedback', onPress: () => {} },
  { title: 'FAQ and Documentation', onPress: () => {} },
  { title: 'About SafetyPin App', onPress: () => {} },
  { title: 'Terms and Conditions', onPress: () => {} },
  { title: 'Privacy Policy', onPress: () => {} },
];

const SettingsScreen: React.FC = () => {
  return (
    <ScrollView style={{ backgroundColor: "#FFFFFF" }}>
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerInner}>
                    <Image
                    accessibilityLabel="Settings icon"
                    testID='settings-icon'
                    source={{
                        uri:
                        'https://cdn.builder.io/api/v1/image/assets/TEMP/d7c704a244d32edfe52f6fd42e805032de383790?apiKey=3d252c2866cb40ed8f1b49e6bfb91bab&',
                    }}
                    style={styles.headerIcon}
                    resizeMode="contain"
                    />

                    <Text style={styles.headerTitle}>Settings</Text>
                </View>
                <View style={styles.separator} />
            </View>

            <SettingsSection title="My Account" items={accountItems} />
            <SettingsSection title="Help" items={helpItems} />

            <View style={styles.padding} />

            <Button onPress={() => {}}>Log Out</Button>

        </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#551022',
    marginVertical: 8,
    // fontFamily: 'Inter',
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'stretch',
    marginTop: 8,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  headerIcon: {
    flexShrink: 0,         
    alignSelf: 'center',     
    width: 34,               
    aspectRatio: 1,
    marginRight: 6,    
  },
  separator: {
    marginVertical: 8,   
    width: '100%',     
    backgroundColor: '#D1D5DB',
    minHeight: 1, 
  },
  padding: {
    height: '4%',
  }
});

export default SettingsScreen;
