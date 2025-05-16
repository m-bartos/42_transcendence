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
    y_center: number;
    x_center: number;
    height: number;
    width: number;
}