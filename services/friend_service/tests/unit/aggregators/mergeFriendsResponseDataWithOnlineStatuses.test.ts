import {mergeFriendsResponseDataWithOnlineStatuses, FriendServiceResponseData} from "../../../src/agregators/dataAggregator";


describe('mergeFriendsResponseDataWithOnlineStatuses', () => {

    const createResponseObj = (userId: number = 88, friendId: number = 24, friendUsername: string = 'olda', avatarUrl: string = 'some_url'): FriendServiceResponseData => ({
        user_id: userId,
        friend_id: friendId,
        friend_username: friendUsername,
        avatar_url: avatarUrl,
        online_status : 'offline'
    })


    it('it should not process the online status array when it is empty', () => {
        const result: FriendServiceResponseData[] = [];
        mergeFriendsResponseDataWithOnlineStatuses([], result)
        expect(result).toEqual([]);
    })

    it('it should not alter the response array when online status array is empty', () => {
        const result: FriendServiceResponseData[] = [createResponseObj()]
        const expectedResult: FriendServiceResponseData[] = [createResponseObj()]
        mergeFriendsResponseDataWithOnlineStatuses([], result);
        expect(result).toEqual(expectedResult);
    })

    it('it should alter the online_status to "online"', () => {
        const result: FriendServiceResponseData[] = [createResponseObj()];
        const onlineUsers: number[] = [24, 1, 35];
        mergeFriendsResponseDataWithOnlineStatuses(onlineUsers, result);
        expect(result).toEqual(expect.arrayContaining([expect.objectContaining({online_status: 'online'})]));
    })


})