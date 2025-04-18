import {
    FriendServiceResponseData,
    mergeFriendsResponseDataWithAuthServiceData,
    AuthUserData
} from "../../../src/agregators/dataAggregator";

describe("mergeFriendsResponseDataWithAuthServiceData", () => {
    /*
    // Data to get from Auth service
export interface AuthUserData {
    id:       number;
    username: string;
    avatar:   string | null;
}
// array of AuthUserData
     */

    const createResponseObj = (userId: number = 88, friendId: number = 124, friendUsername: string = 'olda', avatarUrl: string = 'some_url'): FriendServiceResponseData => ({
        user_id: userId,
        friend_id: friendId,
        friend_username: friendUsername,
        avatar_url: avatarUrl,
        online_status : 'offline'
    })

    const createAuthServiceObj = (id: number = 24, username: string = 'auth_user', avatar: string = 'auth_url') => ({
        id: id, // actually it is friendId
        username: username,
        avatar: avatar
    })
    it('should not alter the response array when auth data is empty', () => {
        const response: FriendServiceResponseData[] = [createResponseObj()];
        const expectedResult: FriendServiceResponseData[] = [createResponseObj()];
        mergeFriendsResponseDataWithAuthServiceData([], response);
        expect(response).toEqual(expectedResult);
    })

    it('should alter response array with altered object values', () => {
        const username = 'jarda';
        const testUrl = 'http://localhost:3000';
        const authData: AuthUserData[] = [createAuthServiceObj(124, username, testUrl)];
        const response: FriendServiceResponseData[] = [createResponseObj()];
        mergeFriendsResponseDataWithAuthServiceData(authData, response);
        expect(response).toEqual(expect.arrayContaining([expect.objectContaining({friend_username: username})]));
        expect(response).toEqual(expect.arrayContaining([expect.objectContaining({avatar_url: testUrl})]));
    })

})