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