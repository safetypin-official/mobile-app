import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PricingModal from '@/components/displays/PremiumModal'; // adjust path as needed :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}

describe('PricingModal', () => {
  const onClose = jest.fn();
  const onUpgradeNow = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows all content when visible=true', () => {
    const { getByTestId } = render(
      <PricingModal visible={true} onClose={onClose} onUpgradeNow={onUpgradeNow} />
    );
    // Modal visibility
    const modal = getByTestId('pricing-modal');
    expect(modal.props.visible).toBe(true);

    // Close button
    expect(getByTestId('close-button')).toBeTruthy();

    // Header and subtitle
    expect(getByTestId('modal-title').props.children).toBe('Upgrade to Premium');
    expect(getByTestId('modal-subtitle').props.children).toMatch(
      /You've hit your limit! Get more out of SafetyPin/
    );

    // Free plan box
    expect(getByTestId('free-plan')).toBeTruthy();
    expect(getByTestId('free-plan-title').props.children).toBe('Free Plan');

    // Premium plan box
    expect(getByTestId('premium-plan')).toBeTruthy();
    expect(getByTestId('premium-plan-title').props.children).toBe('Premium Plan');

    // Upgrade button
    expect(getByTestId('upgrade-button')).toBeTruthy();
  });

  it('hides all content when visible=false', () => {
    const { queryByTestId } = render(
      <PricingModal visible={false} onClose={onClose} onUpgradeNow={onUpgradeNow} />
    );
    // Modal is hidden
    expect(queryByTestId('pricing-modal')).toBeNull();

    // Nothing else should render
    expect(queryByTestId('modal-title')).toBeNull();
    expect(queryByTestId('close-button')).toBeNull();
    expect(queryByTestId('free-plan')).toBeNull();
    expect(queryByTestId('premium-plan')).toBeNull();
    expect(queryByTestId('upgrade-button')).toBeNull();
  });

  it('calls onClose when ✕ button is pressed', () => {
    const { getByTestId } = render(
      <PricingModal visible={true} onClose={onClose} onUpgradeNow={onUpgradeNow} />
    );
    fireEvent.press(getByTestId('close-button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onUpgradeNow when Upgrade Now button is pressed', () => {
    const { getByTestId } = render(
      <PricingModal visible={true} onClose={onClose} onUpgradeNow={onUpgradeNow} />
    );
    fireEvent.press(getByTestId('upgrade-button'));
    expect(onUpgradeNow).toHaveBeenCalledTimes(1);
  });
});
