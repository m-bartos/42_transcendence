export enum RectangleSide {
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