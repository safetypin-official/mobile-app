import React from 'react';
import { TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
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

interface PinProps {
    type?: string;
    onPress: () => void;
    width?: number;   // New prop for width
    height?: number;  // New prop for height
}

const Pin: React.FC<PinProps> = ({ 
    type = "other-crime", 
    onPress, 
    width = 30,    // Default width
    height = 30    // Default height
}) => {
    let pinXml;

    switch (type) {
        case 'lost-item':
            pinXml = lostItemPin;
            break;
        case 'found-item':
            pinXml = foundItemPin;
            break;
        case 'theft':
            pinXml = theftPin;
            break;
        case 'harassment':
            pinXml = harassmentPin;
            break;
        case 'flood':
            pinXml = floodPin;
            break;
        case 'assault':
            pinXml = assaultPin;
            break;
        case 'fire':
            pinXml = firePin;
            break;
        case 'other-disaster':
            pinXml = otherDisasterPin;
            break;
        case 'earthquake':
            pinXml = earthquakePin;
            break;
        case 'other-crime':
            pinXml = otherCrimePin;
            break;
        default:
            pinXml = otherCrimePin;
    }

    return (
        <TouchableOpacity onPress={onPress} testID="pin-touchable">
            <SvgXml xml={pinXml} width={width} height={height} testID="pin-svg" />
        </TouchableOpacity>
    );
};

export default Pin;