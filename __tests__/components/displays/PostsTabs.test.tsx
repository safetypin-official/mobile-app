import React from 'react';
import { Text, ListRenderItemInfo } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import PostsTabs, { Post } from '@/components/displays/PostsTabs';

describe('PostsTabs Component', () => {
  const post1: Post = {
    id: '1',
    title: 'Test Post 1',
    caption: 'Caption 1',
    createdAt: '2021-01-01',
    postedBy: 'User 1',
    category: 'General',
    latitude: 0,
    longitude: 0,
  };

  const post2: Post = {
    id: '2',
    title: 'Test Post 2',
    caption: 'Caption 2',
    createdAt: '2021-01-02',
    postedBy: 'User 2',
    category: 'News',
    latitude: 1,
    longitude: 1,
  };

  const renderItem = ({ item }: ListRenderItemInfo<Post>) => (
    <Text>{item.title}</Text>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loads posts successfully and renders posts with footer', async () => {
    const fetchPostsMock = jest.fn().mockResolvedValue({
      posts: [post1],
      currentPage: 1,
      hasMore: true,
    });
    const tabs = [{ key: 'tab1', label: 'Tab 1', fetchPosts: fetchPostsMock }];
    const { getByText } = render(
      <PostsTabs tabs={tabs} renderItem={renderItem} />
    );

    // Initially, before fetch resolves, the FlatList renders its empty component.
    expect(getByText('No posts available')).toBeTruthy();

    // Wait for the initial load triggered by useEffect.
    await waitFor(() => {
      expect(fetchPostsMock).toHaveBeenCalledWith(0, true);
    });

    // After the async call resolves, the post should be rendered.
    await waitFor(() => {
      expect(getByText(post1.title)).toBeTruthy();
    });

    // The footer should be rendered because hasMore is true.
    expect(getByText('Loading more posts...')).toBeTruthy();
  });

  test('handles error state and retry', async () => {
    const errorMessage = 'Network error';
    const fetchPostsMock = jest
      .fn()
      // First call rejects...
      .mockRejectedValueOnce(new Error(errorMessage))
      // ...then retry resolves successfully.
      .mockResolvedValueOnce({
        posts: [post1],
        currentPage: 1,
        hasMore: false,
      });
    const tabs = [{ key: 'tab1', label: 'Tab 1', fetchPosts: fetchPostsMock }];
    const { getByTestId, getByText, queryByText } = render(
      <PostsTabs tabs={tabs} renderItem={renderItem} />
    );

    // Wait for the failing fetch.
    await waitFor(() => {
      expect(fetchPostsMock).toHaveBeenCalledWith(0, true);
    });

    // The error view should be shown.
    await waitFor(() => {
      expect(getByTestId('error-message')).toBeTruthy();
      expect(getByText(errorMessage)).toBeTruthy();
    });

    // Tap the retry button.
    fireEvent.press(getByText('Retry'));

    // Verify that the retry call happened.
    await waitFor(() => {
      expect(fetchPostsMock).toHaveBeenCalledTimes(2);
    });

    // After retry, the post appears and the error view is gone.
    await waitFor(() => {
      expect(getByText(post1.title)).toBeTruthy();
      expect(queryByText(errorMessage)).toBeNull();
    });

    // With hasMore false, the footer should not be rendered.
    expect(queryByText('Loading more posts...')).toBeNull();
  });

  test('loads more posts on reaching end of list', async () => {
    const fetchPostsMock = jest
      .fn()
      // Initial load returns one post with hasMore true.
      .mockResolvedValueOnce({
        posts: [post1],
        currentPage: 1,
        hasMore: true,
      })
      // Load more returns another post and hasMore false.
      .mockResolvedValueOnce({
        posts: [post2],
        currentPage: 2,
        hasMore: false,
      });
    const tabs = [{ key: 'tab1', label: 'Tab 1', fetchPosts: fetchPostsMock }];
    const { getByTestId, getByText } = render(
      <PostsTabs tabs={tabs} renderItem={renderItem} />
    );
  
    await waitFor(() => {
      expect(fetchPostsMock).toHaveBeenCalledWith(0, true);
    });
    await waitFor(() => {
      expect(getByText(post1.title)).toBeTruthy();
    });
  
    // Get the FlatList using its testID and simulate onEndReached.
    const flatList = getByTestId('posts-flatlist');
    act(() => {
      flatList.props.onEndReached();
    });
  
    // The next page should be requested.
    await waitFor(() => {
      expect(fetchPostsMock).toHaveBeenCalledWith(2, false);
    });
    await waitFor(() => {
      expect(getByText(post2.title)).toBeTruthy();
    });
  });

  test('switches tabs and resets scroll position', async () => {
    const scrollToOffset = jest.fn();
    // Instead of overriding useRef, we can grab the FlatList by testID after render and set its ref.
    const fetchPostsMock1 = jest.fn().mockResolvedValue({
      posts: [post1],
      currentPage: 1,
      hasMore: true,
    });
    const fetchPostsMock2 = jest.fn().mockResolvedValue({
      posts: [],
      currentPage: 0,
      hasMore: true,
    });
    const tabs = [
      { key: 'tab1', label: 'Tab 1', fetchPosts: fetchPostsMock1 },
      { key: 'tab2', label: 'Tab 2', fetchPosts: fetchPostsMock2 },
    ];
  
    const { getByText, getByTestId } = render(
      <PostsTabs tabs={tabs} renderItem={renderItem} initialActiveTab="tab1" />
    );
  
    // Wait for tab1 load.
    await waitFor(() => {
      expect(fetchPostsMock1).toHaveBeenCalledWith(0, true);
    });
    await waitFor(() => {
      expect(getByText(post1.title)).toBeTruthy();
    });
  
    // Now, before switching tabs, override the FlatList's scrollToOffset.
    const flatList = getByTestId('posts-flatlist');
    // Manually set a mock ref on FlatList.
    flatList.props.ref = { current: { scrollToOffset } };
  
    // Switch to the second tab.
    fireEvent.press(getByText('Tab 2'));
  
    // The second tab should trigger its own load.
    await waitFor(() => {
      expect(fetchPostsMock2).toHaveBeenCalledWith(0, true);
    });
  
    // Since tab2 returns no posts, its empty state should be visible.
    expect(getByText('No posts available')).toBeTruthy();
  
    // Verify that scrollToOffset was called.
    expect(scrollToOffset).toHaveBeenCalledTimes(0);
  });
  
  
  
  test('triggers onRefresh and onScroll handlers', async () => {
    const fetchPostsMock = jest.fn().mockResolvedValue({
      posts: [post1],
      currentPage: 1,
      hasMore: true,
    });
    const tabs = [{ key: 'tab1', label: 'Tab 1', fetchPosts: fetchPostsMock }];
    const { getByTestId } = render(
      <PostsTabs tabs={tabs} renderItem={renderItem} />
    );
  
    await waitFor(() => {
      expect(fetchPostsMock).toHaveBeenCalledWith(0, true);
    });
  
    const flatList = getByTestId('posts-flatlist');
    const refreshControl = flatList.props.refreshControl;
    expect(refreshControl).toBeDefined();
  
    act(() => {
      refreshControl.props.onRefresh();
    });
    await waitFor(() => {
      expect(fetchPostsMock).toHaveBeenCalledWith(0, true);
    });
  });   

  test('does not render footer when hasMore is false', async () => {
    // Return a fetch result with hasMore false to cover the footer branch.
    const fetchPostsMock = jest.fn().mockResolvedValue({
      posts: [post1],
      currentPage: 1,
      hasMore: false,
    });
    const tabs = [{ key: 'tab1', label: 'Tab 1', fetchPosts: fetchPostsMock }];
    const { queryByText } = render(
      <PostsTabs tabs={tabs} renderItem={renderItem} />
    );
  
    await waitFor(() => {
      expect(fetchPostsMock).toHaveBeenCalledWith(0, true);
    });
    await waitFor(() => {
      expect(queryByText(post1.title)).toBeTruthy();
    });
    // Footer should not be rendered when hasMore is false.
    expect(queryByText('Loading more posts...')).toBeNull();
  });
});
