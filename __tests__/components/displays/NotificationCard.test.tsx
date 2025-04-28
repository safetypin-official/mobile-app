import { render, fireEvent } from '@testing-library/react-native';
import { NotificationCard } from '@/components/displays/NotificationCard';

jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    SvgXml: ({ xml }: { xml: string }) => <>{xml}</>,
  };
});

const mockProps = {
  avatarUri: 'https://example.com/avatar.jpg',
  username: 'John Doe',
  type: 'comment' as 'comment' | 'follow' | 'report',
  message: 'John commented on your post',
  description: 'Nice post!',
  timestamp: new Date().toISOString(),
  unread: true,
  referenceId: 'abc123',
  onPress: jest.fn(),
};

describe('NotificationCard', () => {
  it('renders correctly with all data', () => {
    const { getByText } = render(<NotificationCard {...mockProps} />);
    expect(getByText(mockProps.message)).toBeTruthy();
    expect(getByText(mockProps.description)).toBeTruthy();
  });

  it('renders timestamp in local string format', () => {
    const { getByText } = render(<NotificationCard {...mockProps} />);
    expect(getByText(new Date(mockProps.timestamp).toLocaleString())).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const { getByText } = render(<NotificationCard {...mockProps} />);
    fireEvent.press(getByText(mockProps.message));
    expect(mockProps.onPress).toHaveBeenCalled();
  });

  it('does not render when unread is false', () => {
    const { queryByText } = render(<NotificationCard {...mockProps} unread={false} />);
    expect(queryByText(mockProps.message)).toBeNull();
  });
});
