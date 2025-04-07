import React from 'react';
import { render } from '@testing-library/react-native';
import SettingsSection from '@/components/settings/SettingsSection';
import { SettingsItemProps } from '@/components/settings/SettingsItem';

// Mock SettingsItem to isolate tests for SettingsSection.
jest.mock('@/components/settings/SettingsItem', () => {
    const { Text } = require('react-native');
    return ({ title }: { title: string }) => {
        return <Text>{title}</Text>;
    };
});

describe('SettingsSection', () => {
  it('renders the header and maps items correctly', () => {
    const items: SettingsItemProps[] = [
      { title: 'Item 1', onPress: jest.fn() },
      { title: 'Item 2', onPress: jest.fn() },
    ];
    const headerText = 'Test Section';
    const { getByText } = render(
      <SettingsSection title={headerText} items={items} />
    );

    // Verify header text is rendered.
    expect(getByText(headerText)).toBeTruthy();

    // Verify that each item is rendered.
    items.forEach((item) => {
      expect(getByText(item.title)).toBeTruthy();
    });
  });

  it('renders correctly when there are no items', () => {
    const headerText = 'Empty Section';
    const { getByText, queryByText } = render(
      <SettingsSection title={headerText} items={[]} />
    );

    // Verify header text is rendered.
    expect(getByText(headerText)).toBeTruthy();

    // Ensure that no additional item text is rendered.
    expect(queryByText('Item 1')).toBeNull();
    expect(queryByText('Item 2')).toBeNull();
  });
});
