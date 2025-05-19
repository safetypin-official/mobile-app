import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Button from '@/components/buttons/Button';

interface PricingModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgradeNow: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({
  visible,
  onClose,
  onUpgradeNow,
}) => {
  return (
    <Modal animationType="slide" visible={visible} transparent={false} testID="pricing-modal">
      <View style={styles.container}>

        <ScrollView contentContainerStyle={styles.content}>

          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton} testID="close-button">
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Header */}
          <Text style={styles.title} testID="modal-title">Upgrade to Premium</Text>
          <Text style={styles.subtitle} testID="modal-subtitle">
            You've hit your limit! Get more out of SafetyPin with our premium plan to continue.
          </Text>

          {/* Pricing Comparison */}
          <View style={styles.planContainer}>
            <View style={[styles.planBox, styles.freePlan]} testID="free-plan">
              <Text style={styles.planTitle} testID="free-plan-title">Free Plan</Text>
              <Text style={styles.planPrice}>Rp0/month</Text>
              <Text style={styles.planItem}>• Browse public posts</Text>
              <Text style={styles.planItem}>• Post up to 3 times/day</Text>
              <Text style={styles.planItem}>• Title: 70 characters</Text>
              <Text style={styles.planItem}>• Description: 200 characters</Text>
            </View>

            <View style={[styles.planBox, styles.premiumPlan]} testID="premium-plan">
              <Text style={styles.planTitle} testID="premium-plan-title">Premium Plan</Text>
              <Text style={styles.planPrice}>Rp49.000/month</Text>
              <Text style={styles.planItem}>• Browse public posts</Text>
              <Text style={styles.planItem}>• Post up to 10 times/day</Text>
              <Text style={styles.planItem}>• Title: 140 characters</Text>
              <Text style={styles.planItem}>• Description: 800 characters</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <View style={styles.ctaButton}>
            <Button onPress={onUpgradeNow} testID="upgrade-button">Upgrade Now</Button>
          </View>
        </ScrollView>

      
      </View>
    </Modal>
  );
};

export default PricingModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    left: 24,
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#222',
  },
  content: {
    paddingTop: 100,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 32,
  },
  planContainer: {
    flexDirection: 'column',
    gap: 24,
  },
  planBox: {
    borderRadius: 16,
    padding: 20,
  },
  freePlan: {
    backgroundColor: '#FFD6D6',
  },
  premiumPlan: {
    backgroundColor: '#FFE2B8',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#444',
  },
  planItem: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  ctaButton: {
    paddingVertical: 14,
  },
});
