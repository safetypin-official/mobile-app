import {
    lostItemTag,
    foundItemTag,
    theftTag,
    harassmentTag,
    floodTag,
    assaultTag,
    fireTag,
    earthquakeTag,
    otherDisasterTag,
    otherCrimeTag
 } from '@/assets/tagsDark';

export const TAGS = [
    { label: 'Lost Item', value: 'lost-item', icon: lostItemTag },
    { label: 'Found Item', value: 'found-item', icon: foundItemTag },
    { label: 'Theft', value: 'theft', icon: theftTag },
    { label: 'Harassment', value: 'harassment', icon: harassmentTag },
    { label: 'Flood', value: 'flood', icon: floodTag },
    { label: 'Assault', value: 'assault', icon: assaultTag },
    { label: 'Fire', value: 'fire', icon: fireTag },
    { label: 'Earthquake', value: 'earthquake', icon: earthquakeTag },
    { label: 'Other Disaster', value: 'other-disaster', icon: otherDisasterTag },
    { label: 'Other Crime', value: 'other-crime', icon: otherCrimeTag },
];
