export type MovementType = 'StockIn' | 'StockOut';

export interface StockMovement {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  movementType: MovementType;
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  remarks?: string;
  timestamp: string;
}

export interface RecordMovementDto {
  productId: number;
  movementType: MovementType;
  quantity: number;
  remarks?: string;
}
