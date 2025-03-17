import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Pin from '@/assets/Pin';
import {
    lostItemPin,
    foundItemPin,
    theftPin,
    harassmentPin,
    floodPin,
    assaultPin,
    firePin,
    otherDisasterPin,
    earthquakePin,
    otherCrimePin
} from '@/assets/pins';

describe('Pin Component', () => {
    const mockOnPress = jest.fn();

    it('renders correctly with default props', () => {
        const { getByTestId } = render(<Pin onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(otherCrimePin);
        expect(pin.props.width).toBe(30);
        expect(pin.props.height).toBe(30);
    });

    it('renders correctly with lost-item type', () => {
        const { getByTestId } = render(<Pin type="lost-item" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(lostItemPin);
    });

    it('renders correctly with found-item type', () => {
        const { getByTestId } = render(<Pin type="found-item" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(foundItemPin);
    });

    it('renders correctly with theft type', () => {
        const { getByTestId } = render(<Pin type="theft" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(theftPin);
    });

    it('renders correctly with harassment type', () => {
        const { getByTestId } = render(<Pin type="harassment" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(harassmentPin);
    });

    it('renders correctly with flood type', () => {
        const { getByTestId } = render(<Pin type="flood" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(floodPin);
    });

    it('renders correctly with assault type', () => {
        const { getByTestId } = render(<Pin type="assault" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(assaultPin);
    });

    it('renders correctly with fire type', () => {
        const { getByTestId } = render(<Pin type="fire" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(firePin);
    });

    it('renders correctly with other-disaster type', () => {
        const { getByTestId } = render(<Pin type="other-disaster" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(otherDisasterPin);
    });

    it('renders correctly with earthquake type', () => {
        const { getByTestId } = render(<Pin type="earthquake" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(earthquakePin);
    });

    it('renders correctly with other-crime type', () => {
        const { getByTestId } = render(<Pin type="other-crime" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(otherCrimePin);
    });

    it('calls onPress when pressed', () => {
        const { getByTestId } = render(<Pin onPress={mockOnPress} />);
        const pin = getByTestId('pin-touchable');
        fireEvent.press(pin);
        expect(mockOnPress).toHaveBeenCalled();
    });

    it('renders correctly with custom width and height', () => {
        const { getByTestId } = render(<Pin onPress={mockOnPress} width={50} height={50} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.width).toBe(50);
        expect(pin.props.height).toBe(50);
    });
});