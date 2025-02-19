// types/messages.ts
export interface PaddleMoveMessage {
    type: 'MOVE_PADDLE';
    direction: 1 | -1;
}