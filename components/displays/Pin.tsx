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
}

const Pin: React.FC<PinProps> = ({ type = "other-crime", onPress }) => {
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
        <TouchableOpacity onPress={onPress} testID='pin-container'>
            <SvgXml xml={pinXml} testID='pin-svg' />
        </TouchableOpacity>
    );
};

export default Pin;