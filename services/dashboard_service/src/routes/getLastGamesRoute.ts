import { getLastGames } from "../handlers/getLastGames.js";
import authenticate  from '../utils/authenticate.js'

export const getLastGamesRoute = {
    url: "/games",
    method: "GET",
    preHandler: authenticate,
    handler: getLastGames,
}