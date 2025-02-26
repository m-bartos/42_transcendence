// types/messages.ts
export interface PaddleMoveMessage {
    type: 'movePaddle';
    direction: 1 | -1;
}