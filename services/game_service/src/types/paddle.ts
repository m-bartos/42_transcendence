export enum PaddleSide {
    Left = 'left',
    Right = 'right',
    Top = 'top',
    Bottom = 'bottom'
}

export enum PaddlePosition {
    Left = 'left',
    Right = 'right'
}

export interface PaddleState {
    yCenter: number;
    height: number;
    width: number;
}

export interface PaddleMoveMessage {
    type: 'movePaddle';
    direction: 1 | -1;
}