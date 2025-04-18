import {mergeFriendsResponseDataWithAuthServiceData,
        mergeFriendsResponseDataWithOnlineStatuses,
        mergeFriendsResponseDataWithFriendUserRecords,
        mergeData } from "../../../src/agregators/dataAggregator";

import {AuthUserData, FriendServiceResponseData, FriendDbRecords} from "../../../src/agregators/dataAggregator";

// create db records mockaup
// create online users data mockup
// create auth users data mockup
// create friend service response object

describe("Test data transformer", () => {

    const dbFriendRecord = (): FriendDbRecords => ({
        id: '10',
        user_id: '2',
        friend_id: '100',
        status: "active",
        online_status: 'offline',
        created_at: Date.now().toString(),
        updated_at: Date.now().toString(),
    });

    const authUserData = (): AuthUserData => ({
        id: 100,
        username: 'Olaf',
        avatar: "http://fake.profile.com",
    })

    const onlineStatusData: number[] = [12, 15, 25, 100, 122, 154];


    const expectedResponse: FriendServiceResponseData[] = [];
    expectedResponse.push({
        user_id: 2,
        friend_id: 100,
        friend_username: 'Olaf',
        avatar_url: "http://fake.profile.com",
        online_status: 'online',
    })

    ///const friendsRecords: FriendDbRecords[] = [dbFriendRecord()];
    it('it should return correct friendResponse data', () => {
        const responseData: FriendServiceResponseData[] = mergeData([dbFriendRecord()], onlineStatusData, [authUserData()]);
        expect(responseData).toEqual(expect.arrayContaining([expect.objectContaining(expectedResponse[0])]));
    })
})