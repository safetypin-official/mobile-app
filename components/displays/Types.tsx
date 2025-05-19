import {
  assaultTag, 
  earthquakeTag, 
  fireTag, 
  floodTag, 
  foundItemTag, 
  harassmentTag, 
  lostItemTag, 
  otherDisasterTag, 
  otherCrimeTag, 
  theftTag 
} from '@/assets/tags';

export type Post = {
    currentVote: string;
    address: string;
    id: string;
    title: string;
    caption: string;
    createdAt: string;
    postedBy: {
      userId: string;
      name: string;
      profilePicture?: string;
    } | null;
    category: string;
    imageUrl?: string;
    latitude: number;
    longitude: number;
    upvoteCount: number;
    downvoteCount: number;
    commentCount: number;
};

export type User = {
    id: string;
    email: string;
    name: string;
    role: string;
    birthdate: string;
    provider: string;
    profilePicture?: string | null;
    profileBanner?: string | null;
    verified: boolean;
};

export type CommentNotification = {
  commentContent: string | undefined; 
  type: string;
  actorUserId: string;
  actorName: string;
  actorProfilePictureUrl: string | null;
  timeAgo: string;
  postId: string;
  commentId: string;
  replyId: string | null;
  createdAt: string;
};

export type FollowNotification = {
  userId: string;
  name: string;
  profilePicture: string;
  followedAt: string;
  daysAgo: number;
}

export type CommentReply = {
  id: string;
  caption: string;
  postedBy: {
    userId: string;
    name: string;
    profilePicture?: string;
  };
  postedById: string;
  createdAt: string;
};

export type ReplyPagination = {
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  currentPage: number;
  content: CommentReply[];
};

export type TagInfo = {
  icon: string;
  color: string;
};

export const TAGS_MAP: Record<string, TagInfo> = {
  "Lost Item": { icon: lostItemTag, color: "#9F3F3D" },
  "Found Item": { icon: foundItemTag, color: "#5E9F3D" },
  "Theft": { icon: theftTag, color: "#9F3F3D" },
  "Harassment": { icon: harassmentTag, color: "#9F3F3D" },
  "Flood": { icon: floodTag, color: "#3D719F" },
  "Assault": { icon: assaultTag, color: "#9F3F3D" },
  "Fire": { icon: fireTag, color: "#BA1A1A" },
  "Other Natural Disasters": { icon: otherDisasterTag, color: "#391E1D" },
  "Earthquake": { icon: earthquakeTag, color: "#745A2B" },
  "Other Crime": { icon: otherCrimeTag, color: "#9F3F3D" },
  "Infrastructure Issue": { icon: otherCrimeTag, color: "#9F3F3D" },
  "Crime Watch": { icon: theftTag, color: "#9F3F3D" },
  "Lost Book": { icon: lostItemTag, color: "#9F3F3D" },
  "Lost Pet": { icon: lostItemTag, color: "#9F3F3D" },
  "Service Issue": { icon: otherCrimeTag, color: "#9F3F3D" },
  "Flooding": { icon: floodTag, color: "#3D719F" },
  "Stolen Vehicle": { icon: theftTag, color: "#9F3F3D" }
};

export const getTagInfo = (tag: string): TagInfo => {
  return TAGS_MAP[tag] || { icon: otherCrimeTag, color: "#9F3F3D" };
};