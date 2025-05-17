import React from 'react';
import { TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {
    likeIcon,
    dislikeIcon,
    commentIcon,
} from '../../../assets/userInteractions';

interface UserInteractionProps {
    type?: string;
    onPress: () => void;
    width?: number;   // New prop for width
    height?: number;  // New prop for height
    fill?: string;    // New prop for fill color
    testID?: string;  // Add testID prop
}

const UserInteraction: React.FC<UserInteractionProps> = ({ 
    type = "like-icon", 
    onPress, 
    width = 24,      // Default width
    height = 24,     // Default height
    fill = "#7F7574", // Default fill color
    testID = "svg-icon" // Default testID
}) => {
    let userInteractionXml;
    let iconTestID;

    switch (type) {
        case 'like-icon':
            // Dynamically replace the fill color in the SVG
            userInteractionXml = likeIcon.replace('fill="#5E9F3D"', `fill="${fill}"`);
            iconTestID = testID || 'like-icon';
            break;
        case 'dislike-icon':
            userInteractionXml = dislikeIcon.replace('fill="#904A47"', `fill="${fill}"`);
            iconTestID = testID || 'dislike-icon';
            break;
        case 'comment-icon':
            userInteractionXml = commentIcon.replace('fill="#5E9F3D"', `fill="${fill}"`);
            iconTestID = testID || 'comment-icon';
            break;
        default:
            userInteractionXml = likeIcon.replace('fill="#5E9F3D"', `fill="${fill}"`);
            iconTestID = testID || 'default-icon';
    }

    return (
        <TouchableOpacity onPress={onPress}>
            <SvgXml 
                xml={userInteractionXml} 
                width={width} 
                height={height}
                testID={iconTestID}
            />
        </TouchableOpacity>
    );
};

export default UserInteraction;