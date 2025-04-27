import { ConsumerStatus, AsyncMessage} from 'rabbitmq-client'
import parseGameEndedEventMessageMulti from "../utils/parseGameEndedMessageMulti.js";
import parseGameEndedEventMessageSplit from "../utils/parserGameEndedMessageSplit.js";
import {insertGameMultiplayerResults, insertGameSplitResults} from "../config/configKnexAndSql.js";

// README
// ConsumerStatus = way to tell rabbitMq-client what to do after the handler fails/message processing fails.
// codes
// ACK == 0 - ok / message deleted from the queue
// REQUEUE == 1 - retry later - massage goes back to the queue/not ACK for deletion
// DROP == 2 - permanent failure (message lost)

export async function handleGameEndEvents(msg: AsyncMessage): Promise<(ConsumerStatus)> {
    try{
        if (msg.routingKey === 'game.end.multi')
        {
            console.log("Parsed game-end multiplayer message: ", parseGameEndedEventMessageMulti(msg.body))
            await insertGameMultiplayerResults(parseGameEndedEventMessageMulti(msg.body));
            return ConsumerStatus.ACK;
        }
        if (msg.routingKey === 'game.end.split')
        {
            console.log("Parsed game-end split keyboard message: ", parseGameEndedEventMessageSplit(msg.body))
            await insertGameSplitResults(parseGameEndedEventMessageSplit(msg.body));
            return ConsumerStatus.ACK;
        }
        if (msg.routingKey === 'game.end.tournament')
        {
            console.log("game.end.tournament");
            return ConsumerStatus.ACK;
        }
        else {
            return ConsumerStatus.REQUEUE;
        }
    }
    catch(error){
        console.log("Error processing the message", error);
        return ConsumerStatus.REQUEUE;
    }
}