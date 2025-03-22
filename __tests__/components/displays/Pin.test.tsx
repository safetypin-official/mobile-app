import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Pin from '@/components/displays/Pin';
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
        const { getByTestId } = render(<Pin type="Lost Item" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(lostItemPin);
    });

    it('renders correctly with found-item type', () => {
        const { getByTestId } = render(<Pin type="Found Item" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(foundItemPin);
    });

    it('renders correctly with theft type', () => {
        const { getByTestId } = render(<Pin type="Theft" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(theftPin);
    });

    it('renders correctly with harassment type', () => {
        const { getByTestId } = render(<Pin type="Harassment" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(harassmentPin);
    });

    it('renders correctly with flood type', () => {
        const { getByTestId } = render(<Pin type="Flood" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(floodPin);
    });

    it('renders correctly with assault type', () => {
        const { getByTestId } = render(<Pin type="Assault" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(assaultPin);
    });

    it('renders correctly with fire type', () => {
        const { getByTestId } = render(<Pin type="Fire" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(firePin);
    });

    it('renders correctly with other-disaster type', () => {
        const { getByTestId } = render(<Pin type="Other Disaster" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(otherDisasterPin);
    });

    it('renders correctly with earthquake type', () => {
        const { getByTestId } = render(<Pin type="Earthquake" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(earthquakePin);
    });

    it('renders correctly with other-crime type', () => {
        const { getByTestId } = render(<Pin type="Other Crime" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(otherCrimePin);
    });

    it('renders correctly with lost book type', () => {
        const { getByTestId } = render(<Pin type="Lost Book" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(lostItemPin);
    });

    it('renders correctly with lost pet type', () => {
        const { getByTestId } = render(<Pin type="Lost Pet" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(lostItemPin);
    });

    it('renders correctly with infrastructure issue type', () => {
        const { getByTestId } = render(<Pin type="Infrastructure Issue" onPress={mockOnPress} />);
        const pin = getByTestId('pin-svg');
        expect(pin.props.xml).toBe(otherDisasterPin);
    });

    it('renders correctly with other type', () => {
        const { getByTestId } = render(<Pin type="Something" onPress={mockOnPress} />);
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