import { extractFriendIds } from "../../../src/utils/extractFriendIds";
import { FriendDbRecords } from '../../../src/agregators/dataAggregator';

describe('extracting friend ids from db array of objects', () => {

    const createDbRecord = (friend_id: string = '24'): FriendDbRecords => ({
        id: '1',
        user_id: '2',
        friend_id: friend_id,
        status: "active",
        online_status: "offline",
        created_at: Date.now().toString(),
        updated_at: Date.now().toString(),
    })


    it('returns empty array', () => {
        const result = extractFriendIds([]);
        expect(result).toEqual([]);
    })

    it('returns one friend id', () => {
        const friend_id = '100';
        const expectedValue = [friend_id];
        const result = extractFriendIds([createDbRecord(friend_id)]);
        expect(result).toEqual(expectedValue);
    })

    it('returns some friend id', () => {
        const friend_id1 = '100';
        const friend_id2 = '101';
        const friend_id3 = '102';

        const expectedValue = [friend_id1, friend_id2, friend_id3];
        const result = extractFriendIds([createDbRecord(friend_id1), createDbRecord(friend_id2), createDbRecord(friend_id3)]);
        expect(result).toEqual(expectedValue);
    })


    it('returns friend id - testing how it handles no string ids', () => {
        const friend_id1 = '100';
        const friend_id2 = '101';
        const friend_id3 = 102;
        const expectedValue = [friend_id1, friend_id2, friend_id3.toString()];
        //@ts-ignore
        const result = extractFriendIds([createDbRecord(friend_id1), createDbRecord(friend_id2), createDbRecord(friend_id3)]);
        expect(result).toEqual(expectedValue);
    })

})