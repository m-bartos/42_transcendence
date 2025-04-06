import { ConsumerStatus, AsyncMessage} from 'rabbitmq-client'
import parseGameEndedEventMessage from "./parseGameEndedMessage.js";
import { insertGameResults} from "./configKnexAndSql.js";
// import knex module
// save message to sqlite

// README
// ConsumerStatus = way to tell rabbitMq-client what to do after the handler fails/message processing fails.
// codes
// ACK == 0 - ok / message deleted from the queue
// REQUEUE == 1 - retry later - massage goes back to the queue/not ACK for deletion
// DROP == 2 - permanent failure (message lost)

export async function handleGameEndEvent(msg: AsyncMessage): Promise<(ConsumerStatus)> {
    try{
        if (msg.routingKey === 'game.end')
        {
            console.log("Parsed game-end message: ", parseGameEndedEventMessage(msg.body))
            await insertGameResults(parseGameEndedEventMessage(msg.body));
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