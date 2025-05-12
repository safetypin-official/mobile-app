import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import DataTabs, { FetchResult, TabConfig } from '@/components/displays/DataTabs';

describe('DataTabs Component', () => {
  const defaultRenderItem = ({ item }: { item: string }) => (
    <Text testID={`item-${item}`}>{item}</Text>
  );
  const defaultKeyExtractor = (item: string) => item;

  it('shows empty list and does not auto-load when disableAutoLoad is true', () => {
    const fetchFn = jest.fn<Promise<FetchResult<string>>, [number, boolean]>();
    const tabs: TabConfig<string>[] = [
      { key: 'tab1', label: 'Tab1', fetchData: fetchFn },
    ];

    const { getByText } = render(<DataTabs tabs={tabs} disableAutoLoad />);
    expect(fetchFn).not.toHaveBeenCalled();
    expect(getByText('No items available')).toBeTruthy();
  });

  it('loads data on mount and displays items with footer when hasMore=true', async () => {
    const fetchFn = jest.fn<Promise<FetchResult<string>>, [number, boolean]>()
      .mockResolvedValue({ items: ['a', 'b'], currentPage: 0, hasMore: true });
    const tabs: TabConfig<string>[] = [
      {
        key: 'tab1',
        label: 'Tab1',
        fetchData: fetchFn,
        renderItem: defaultRenderItem,
        keyExtractor: defaultKeyExtractor,
      },
    ];

    const { getByText, getByTestId } = render(<DataTabs tabs={tabs} />);

    // before fetch resolves we still see the empty-list component:
    expect(getByText('No items available')).toBeTruthy();

    // wait for the fetch to finish
    await waitFor(() => expect(fetchFn).toHaveBeenCalledWith(0, true));

    // now items render
    expect(getByTestId('item-a')).toBeTruthy();
    expect(getByTestId('item-b')).toBeTruthy();

    // footer loader shows when hasMore = true
    expect(getByText('Loading more…')).toBeTruthy();
  });

  it('triggers loadMore on end reached', async () => {
    const fetchFn = jest.fn<Promise<FetchResult<string>>, [number, boolean]>()
      .mockResolvedValueOnce({ items: ['x'], currentPage: 0, hasMore: true })
      .mockResolvedValueOnce({ items: ['y'], currentPage: 1, hasMore: false });
    const tabs: TabConfig<string>[] = [
      {
        key: 'tab1',
        label: 'Tab1',
        fetchData: fetchFn,
        renderItem: defaultRenderItem,
        keyExtractor: defaultKeyExtractor,
      },
    ];

    const { getByTestId } = render(<DataTabs tabs={tabs} />);
    await waitFor(() => expect(fetchFn).toHaveBeenCalledWith(0, true));

    fetchFn.mockClear();
    const flatList = getByTestId('flat-list');

    // fire the onEndReached event
    fireEvent(flatList, 'onEndReached');
    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(0));
  });

  it('does not show footer when hasMore=false', async () => {
    const fetchFn = jest.fn<Promise<FetchResult<string>>, [number, boolean]>()
      .mockResolvedValue({ items: ['z'], currentPage: 0, hasMore: false });
    const tabs: TabConfig<string>[] = [
      {
        key: 'tab1',
        label: 'Tab1',
        fetchData: fetchFn,
        renderItem: defaultRenderItem,
        keyExtractor: defaultKeyExtractor,
      },
    ];

    const { queryByText, getByTestId } = render(<DataTabs tabs={tabs} />);
    await waitFor(() => expect(fetchFn).toHaveBeenCalledWith(0, true));

    expect(getByTestId('item-z')).toBeTruthy();
    expect(queryByText('Loading more…')).toBeNull();
  });

  it('refreshes data when pull-to-refresh is triggered', async () => {
    const fetchFn = jest.fn<Promise<FetchResult<string>>, [number, boolean]>()
      .mockResolvedValue({ items: [], currentPage: 0, hasMore: false });
    const tabs: TabConfig<string>[] = [
      { key: 'tab1', label: 'Tab1', fetchData: fetchFn },
    ];

    const { getByTestId } = render(<DataTabs tabs={tabs} />);
    await waitFor(() => expect(fetchFn).toHaveBeenCalledWith(0, true));

    fetchFn.mockClear();
    const flatList = getByTestId('flat-list');
    const rc = flatList.props.refreshControl;
    
    // trigger pull-to-refresh
    rc.props.onRefresh();
    await waitFor(() => expect(fetchFn).toHaveBeenCalledWith(0, true));
  });

  it('displays error view and retries on failure', async () => {
    const fetchFn = jest.fn<Promise<FetchResult<string>>, [number, boolean]>()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValue({ items: ['z'], currentPage: 0, hasMore: false });
    const tabs: TabConfig<string>[] = [
      {
        key: 'tab1',
        label: 'Tab1',
        fetchData: fetchFn,
        renderItem: defaultRenderItem,
        keyExtractor: defaultKeyExtractor,
      },
    ];

    const { getByText, queryByText, getByTestId } = render(
      <DataTabs tabs={tabs} />
    );
    // first fetch fails
    await waitFor(() => expect(fetchFn).toHaveBeenCalledWith(0, true));
    expect(getByText('network error')).toBeTruthy();

    // press Retry
    fireEvent.press(getByText('Retry'));
    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(2));

    // now the new data shows
    expect(getByTestId('item-z')).toBeTruthy();
    expect(queryByText('network error')).toBeNull();
  });

  it('uses global renderItem/keyExtractor when not provided in tab config', async () => {
    const fetchFn = jest.fn<Promise<FetchResult<string>>, [number, boolean]>()
      .mockResolvedValue({ items: ['g'], currentPage: 0, hasMore: false });
    const globalRender = ({ item }: { item: string }) => (
      <Text testID={`global-${item}`}>{item}</Text>
    );
    const globalKeyExtractor = (item: string) => `key-${item}`;
    const tabs: TabConfig<string>[] = [
      { key: 'tab1', label: 'Tab1', fetchData: fetchFn },
    ];

    const { getByTestId } = render(
      <DataTabs
        tabs={tabs}
        renderItem={globalRender}
        keyExtractor={globalKeyExtractor}
      />
    );
    await waitFor(() => expect(fetchFn).toHaveBeenCalledWith(0, true));
    expect(getByTestId('global-g')).toBeTruthy();
  });

  it('respects initialActiveTab prop', async () => {
    const fetch1 = jest.fn<Promise<FetchResult<string>>, [number, boolean]>()
      .mockResolvedValue({ items: ['a1'], currentPage: 0, hasMore: false });
    const fetch2 = jest.fn<Promise<FetchResult<string>>, [number, boolean]>()
      .mockResolvedValue({ items: ['b1'], currentPage: 0, hasMore: false });
    const tabs: TabConfig<string>[] = [
      {
        key: 'tab1',
        label: 'Tab1',
        fetchData: fetch1,
        renderItem: defaultRenderItem,
        keyExtractor: defaultKeyExtractor,
      },
      {
        key: 'tab2',
        label: 'Tab2',
        fetchData: fetch2,
        renderItem: defaultRenderItem,
        keyExtractor: defaultKeyExtractor,
      },
    ];

    const { getByTestId } = render(
      <DataTabs tabs={tabs} initialActiveTab="tab2" />
    );
    await waitFor(() => expect(fetch2).toHaveBeenCalledWith(0, true));
    expect(getByTestId('item-b1')).toBeTruthy();
  });

  it('passes contentContainerStyle to FlatList', async () => {
    const style = { padding: 5 };
    const fetchFn = jest.fn<Promise<FetchResult<string>>, [number, boolean]>()
      .mockResolvedValue({ items: [], currentPage: 0, hasMore: false });
    const tabs: TabConfig<string>[] = [
      { key: 'tab1', label: 'Tab1', fetchData: fetchFn },
    ];

    const { getByTestId } = render(
      <DataTabs tabs={tabs} contentContainerStyle={style} />
    );
    await waitFor(() => expect(fetchFn).toHaveBeenCalledWith(0, true));

    const flatList = getByTestId('flat-list');
    expect(flatList.props.contentContainerStyle).toEqual(style);
  });

  it('shows and hides the active‐tab indicator correctly', async () => {
    const fetchFn = jest.fn<Promise<FetchResult<string>>, [number, boolean]>()
      .mockResolvedValue({ items: [], currentPage: 0, hasMore: false });
    const tabs: TabConfig<string>[] = [
      {
        key: 'tab1',
        label: 'Tab1',
        fetchData: fetchFn,
      },
      {
        key: 'tab2',
        label: 'Tab2',
        fetchData: fetchFn,
      },
    ];

    const { getByTestId, getByText, queryByTestId } = render(
      <DataTabs tabs={tabs} />
    );
    // by default tab1 is active
    expect(getByTestId('indicator-tab1')).toBeTruthy();
    expect(queryByTestId('indicator-tab2')).toBeNull();

    // switch to tab2
    fireEvent.press(getByText('Tab2'));
    await waitFor(() => expect(getByTestId('indicator-tab2')).toBeTruthy());
    expect(queryByTestId('indicator-tab1')).toBeNull();
  });
});