import React from 'react';
import { TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {
    likeIcon,
    dislikeIcon
} from '@/assets/userInteractions';

interface UserInteractionProps {
    type?: string;
    onPress: () => void;
}

const UserInteraction: React.FC<UserInteractionProps> = ({ type = "other-crime", onPress }) => {
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
            <SvgXml xml={userInteractionXml} />
        </TouchableOpacity>
    );
};

export default UserInteraction;