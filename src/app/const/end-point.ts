// src/app/constants/endpoint.ts
export class Endpoint {
  public static readonly API_BASE: string = 'http://localhost:3000/';
  public static readonly API_VERSION: string = 'api/';

  // Auth
  public static readonly SIGNUP = Endpoint.API_BASE + Endpoint.API_VERSION + 'signup';
  // public static readonly SIGNUP_FARMER = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/signup/farmer';
  public static readonly LOGIN = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/login';

  // Products
  public static readonly ADD_PRODUCT = Endpoint.API_BASE + Endpoint.API_VERSION + 'products';
  public static readonly GET_ALL_PRODUCTS = Endpoint.API_BASE + Endpoint.API_VERSION + 'products';
  public static readonly GET_PRODUCT_BY_ID = (id: string) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `products/${id}`;
}
