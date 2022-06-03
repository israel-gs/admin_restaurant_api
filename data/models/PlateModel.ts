import { ObjectId } from "mongodb";

export interface PlateModel {
  name: string;
  price: number;
  description: string;
  code: string;
  categoryId: ObjectId;
}
