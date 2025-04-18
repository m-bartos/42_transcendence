import { mergeFriendsResponseDataWithFriendUserRecords, FriendDbRecords, FriendServiceResponseData } from '../../../src/agregators/dataAggregator';

describe('Test the function - mergeFriendsResponseDataWithFriendUserRecords', () => {
  // Helper to create a minimal FriendDbRecords object
  const createRecord = (userId: string, friendId: string): FriendDbRecords => ({
    id: '1',
    user_id: userId,
    friend_id: friendId,
    status: 'active',
    online_status: 'offline',
    created_at: '',
    updated_at: '',
  });

  it('should do nothing when input array is empty', () => {
    const result: FriendServiceResponseData[] = [];
    mergeFriendsResponseDataWithFriendUserRecords([], result);
    expect(result).toEqual([]);
  });

  it('should parse numeric strings and initialize fields correctly', () => {
    const records: FriendDbRecords[] = [createRecord('10', '20')];
    const result: FriendServiceResponseData[] = [];
    mergeFriendsResponseDataWithFriendUserRecords(records, result);
    expect(result).toEqual([
      {
        user_id: 10,
        friend_id: 20,
        friend_username: null,
        avatar_url: null,
        online_status: 'offline',
      },
    ]);
  });

  it('should set null for non-numeric IDs', () => {
    const records: FriendDbRecords[] = [
      createRecord('abc', '5'),
      createRecord('5', 'xyz'),
    ];
    const result: FriendServiceResponseData[] = [];
    mergeFriendsResponseDataWithFriendUserRecords(records, result);
    expect(result[0].user_id).toBeNull();
    expect(result[0].friend_id).toBe(5);
    expect(result[1].user_id).toBe(5);
    expect(result[1].friend_id).toBeNull();
  });

  it('should parse decimal numeric strings', () => {
    const records: FriendDbRecords[] = [createRecord('3.14', '6.28')];
    const result: FriendServiceResponseData[] = [];
    mergeFriendsResponseDataWithFriendUserRecords(records, result);
    expect(result[0].user_id).toBeCloseTo(3.14);
    expect(result[0].friend_id).toBeCloseTo(6.28);
  });

  it('should handle multiple records preserving order', () => {
    const records: FriendDbRecords[] = [
      createRecord('1', '2'),
      createRecord('3', '4'),
      createRecord('NaN', 'NaN'),
    ];
    const result: FriendServiceResponseData[] = [];
    mergeFriendsResponseDataWithFriendUserRecords(records, result);
    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({ user_id: 1, friend_id: 2 });
    expect(result[1]).toMatchObject({ user_id: 3, friend_id: 4 });
    expect(result[2]).toMatchObject({ user_id: null, friend_id: null });
  });
});
