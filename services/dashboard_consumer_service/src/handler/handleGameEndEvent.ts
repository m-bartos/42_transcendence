import { ConsumerStatus, AsyncMessage} from 'rabbitmq-client'
import parseGameEndedEventMessage from "../utils/parseGameEndedMessage.js";
import { insertGameResults } from "../config/configKnexAndSql.js";

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