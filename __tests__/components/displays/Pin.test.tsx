import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Pin from '@/components/displays/Pin';
import { lostItemPin, foundItemPin, theftPin, harassmentPin, floodPin, assaultPin, firePin, otherDisasterPin, earthquakePin, otherCrimePin } from '@/assets/pins';

describe('Pin Component', () => {
    const mockOnPress = jest.fn();

    afterEach(() => {
        mockOnPress.mockClear();
    });

    it('renders without crashing', () => {
        const { getByTestId } = render(<Pin onPress={mockOnPress} />);
        expect(getByTestId('pin-container')).toBeTruthy();
    });

    it('renders the correct pin for each type', () => {
        const { getByTestId } = render(<Pin type="lost-item" onPress={mockOnPress} />);
        expect(getByTestId('pin-svg').props.xml).toBe(lostItemPin);

        const { getByTestId: foundItemTestId } = render(<Pin type="found-item" onPress={mockOnPress} />);
        expect(foundItemTestId('pin-svg').props.xml).toBe(foundItemPin);

        const { getByTestId: theftTestId } = render(<Pin type="theft" onPress={mockOnPress} />);
        expect(theftTestId('pin-svg').props.xml).toBe(theftPin);

        const { getByTestId: harassmentTestId } = render(<Pin type="harassment" onPress={mockOnPress} />);
        expect(harassmentTestId('pin-svg').props.xml).toBe(harassmentPin);

        const { getByTestId: floodTestId } = render(<Pin type="flood" onPress={mockOnPress} />);
        expect(floodTestId('pin-svg').props.xml).toBe(floodPin);

        const { getByTestId: assaultTestId } = render(<Pin type="assault" onPress={mockOnPress} />);
        expect(assaultTestId('pin-svg').props.xml).toBe(assaultPin);

        const { getByTestId: fireTestId } = render(<Pin type="fire" onPress={mockOnPress} />);
        expect(fireTestId('pin-svg').props.xml).toBe(firePin);

        const { getByTestId: otherDisasterTestId } = render(<Pin type="other-disaster" onPress={mockOnPress} />);
        expect(otherDisasterTestId('pin-svg').props.xml).toBe(otherDisasterPin);

        const { getByTestId: earthquakeTestId } = render(<Pin type="earthquake" onPress={mockOnPress} />);
        expect(earthquakeTestId('pin-svg').props.xml).toBe(earthquakePin);

        const { getByTestId: otherCrimeTestId } = render(<Pin type="other-crime" onPress={mockOnPress} />);
        expect(otherCrimeTestId('pin-svg').props.xml).toBe(otherCrimePin);
    });

    it('renders default pin for unknown type', () => {
        const { getByTestId } = render(<Pin type="unknown-type" onPress={mockOnPress} />);
        expect(getByTestId('pin-svg').props.xml).toBe(otherCrimePin);
    });

    it('calls onPress when TouchableOpacity is pressed', () => {
        const { getByTestId } = render(<Pin onPress={mockOnPress} />);
        fireEvent.press(getByTestId('pin-container'));
        expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
});
