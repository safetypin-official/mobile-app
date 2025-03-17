import React from 'react';
import { TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
    lostItemTag,
    foundItemTag,
    theftTag,
    harassmentTag,
    floodTag,
    assaultTag,
    fireTag,
    otherDisasterTag,
    earthquakeTag,
    otherCrimeTag
} from './tags';

interface TagProps {
    type?: string;
    onPress: () => void;
}

const Tag: React.FC<TagProps> = ({ type = "other-crime", onPress }) => {
    let pinXml;

    switch (type) {
        case 'lost-item':
            pinXml = lostItemTag;
            break;
        case 'found-item':
            pinXml = foundItemTag;
            break;
        case 'theft':
            pinXml = theftTag;
            break;
        case 'harassment':
            pinXml = harassmentTag;
            break;
        case 'flood':
            pinXml = floodTag;
            break;
        case 'assault':
            pinXml = assaultTag;
            break;
        case 'fire':
            pinXml = fireTag;
            break;
        case 'other-disaster':
            pinXml = otherDisasterTag;
            break;
        case 'earthquake':
            pinXml = earthquakeTag;
            break;
        case 'other-crime':
            pinXml = otherCrimeTag;
            break;
        default:
            pinXml = otherCrimeTag;
    }

    return (
        <TouchableOpacity onPress={onPress}>
            <SvgXml xml={pinXml} style={{ width: 6, height: 6 }} />
        </TouchableOpacity>
    );
};

export default Tag;