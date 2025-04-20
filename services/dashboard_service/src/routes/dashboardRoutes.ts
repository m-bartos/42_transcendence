import authenticate  from '../utils/authenticate.js'
import { getMultiplayerGames } from "../handlers/getMultiplayerGames.js";
import { getSplitKeyboardGames } from "../handlers/getSplitKeyboardGames.js";

export const getMultiGames = {
    url: "/multiplayer",
    method: 'POST',
    preHandler: authenticate,
    handler: getMultiplayerGames
    // add schemas
}

export const getSplitGames = {
    url: "/split",
    method: 'POST',
    preHandler: authenticate,
    handler: getSplitKeyboardGames
    // add schemas
}