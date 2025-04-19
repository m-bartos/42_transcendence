import { getWins } from "../handlers/getLastGames.js";
import authenticate  from '../utils/authenticate.js'
import {getMultiplayerGames} from "../handlers/getMultiplayerGames.js";

export const gamesWins = {
    url: "/games/wins",
    method: "GET",
    preHandler: authenticate,
    handler: getWins,
}

export const getMultiGames = {
    url: "/games/last",
    method: 'POST',
    preHandler: authenticate,
    handler: getMultiplayerGames
}