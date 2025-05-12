import { Post, FetchResult } from '@/components/displays/PostsTabs';

const PAGE_SIZE = 10;

export async function fetchPostsByType(type: 'distance' | 'timestamp', page: number, userLocation?: { latitude: number; longitude: number }): Promise<FetchResult> {
  let url = '';
  if (type === 'distance') {
    if (!userLocation) throw new Error('Location is required for distance-based posts');
    url = `https://safetypin.ppl.cs.ui.ac.id/post/feed/distance?lat=${userLocation.latitude}&lon=${userLocation.longitude}&page=${page}&size=${PAGE_SIZE}`;
  } else {
    url = `https://safetypin.ppl.cs.ui.ac.id/post/feed/timestamp?page=${page}&size=${PAGE_SIZE}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const responseData = await response.json();
  const data = responseData.data?.content || [];
  const posts: Post[] = data.map((item: any) => {
    const post = item.post || item;
    return {
      id: post.id,
      title: post.title || 'Untitled',
      caption: post.caption || '',
      createdAt: post.createdAt,
      postedBy: post.postedBy,
      category: post.category || 'general',
      imageUrl: post.imageUrl,
      latitude: post.latitude || 0,
      longitude: post.longitude || 0,
    };
  });

  const hasMore = responseData.data ? !responseData.data.last : posts.length === PAGE_SIZE;

  return {
    posts,
    currentPage: page,
    hasMore,
  };
}
