import React from 'react';
import { TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {
    likeIcon,
    dislikeIcon
} from './userInteractions';

interface UserInteractionProps {
    type?: string;
    onPress: () => void;
    width?: number;   // New prop for width
    height?: number;  // New prop for height
    fill?: string;    // New prop for fill color
}

const UserInteraction: React.FC<UserInteractionProps> = ({ 
    type = "like-icon", 
    onPress, 
    width = 24,      // Default width
    height = 24,     // Default height
    fill = "#7F7574" // Default fill color
}) => {
    let userInteractionXml;

    switch (type) {
        case 'like-icon':
            userInteractionXml = likeIcon;
            break;
        case 'dislike-icon':
            userInteractionXml = dislikeIcon;
            break;
        default:
            userInteractionXml = likeIcon;
    }

    return (
        <TouchableOpacity onPress={onPress}>
            <SvgXml 
                xml={userInteractionXml} 
                width={width} 
                height={height}
                fill={fill}
            />
        </TouchableOpacity>
    );
};

export default UserInteraction;