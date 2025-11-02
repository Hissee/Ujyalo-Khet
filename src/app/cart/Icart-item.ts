import { IProduct } from '../product/Iproduct';

export interface ICartItem {
  product: IProduct;
  quantity: number;
}

