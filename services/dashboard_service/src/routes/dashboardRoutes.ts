import { getWins } from "../handlers/getLastGames.js";
import authenticate  from '../utils/authenticate.js'

export const gamesWins = {
    url: "/games/wins",
    method: "GET",
    preHandler: authenticate,
    handler: getWins,
}