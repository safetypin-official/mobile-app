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
        case 'Lost Item':
            pinXml = lostItemPin;
            break;
        case 'Found Item':
            pinXml = foundItemPin;
            break;
        case 'Theft':
            pinXml = theftPin;
            break;
        case 'Harassment':
            pinXml = harassmentPin;
            break;
        case 'Flood':
            pinXml = floodPin;
            break;
        case 'Assault':
            pinXml = assaultPin;
            break;
        case 'Fire':
            pinXml = firePin;
            break;
        case 'Other Disaster':
            pinXml = otherDisasterPin;
            break;
        case 'Earthquake':
            pinXml = earthquakePin;
            break;
        case 'Other Crime':
            pinXml = otherCrimePin;
            break;
        case 'Lost Book':
            pinXml = lostItemPin;
            break;
        case 'Lost Pet':
            pinXml = lostItemPin;
            break;
        case 'Infrastructure Issue':
            pinXml = otherDisasterPin;
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