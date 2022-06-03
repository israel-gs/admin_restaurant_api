import { ObjectId } from "mongodb";
import { PlateModel } from "./PlateModel";

export interface OrderModel {
  userId: ObjectId;
  tableId: ObjectId;
  date: Date;
  tip: number;
  plates: OrderPlateModel[];
  orderClosed: boolean;
}

export interface OrderPlateModel {
  plate: PlateModel;
  quantity: number;
}
