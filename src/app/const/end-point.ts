// src/app/constants/endpoint.ts
export class Endpoint {
  public static readonly API_BASE: string = 'http://localhost:3000/';
  public static readonly API_VERSION: string = 'api/';

  // Auth
  public static readonly SIGNUP_CUSTOMER = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/signup/customer';
  public static readonly SIGNUP_FARMER = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/signup/farmer';
  public static readonly LOGIN = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/login';
  public static readonly VERIFY_EMAIL = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/verify-email';
  public static readonly RESEND_VERIFICATION = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/resend-verification';

  // Products
  public static readonly ADD_PRODUCT = Endpoint.API_BASE + Endpoint.API_VERSION + 'products';
  public static readonly GET_ALL_PRODUCTS = Endpoint.API_BASE + Endpoint.API_VERSION + 'products';
  public static readonly GET_PRODUCT_BY_ID = (id: string) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `products/${id}`;
  public static readonly UPDATE_PRODUCT = (id: string) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `products/${id}`;
  public static readonly DELETE_PRODUCT = (id: string) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `products/${id}`;

  // Orders
  public static readonly PLACE_ORDER = Endpoint.API_BASE + Endpoint.API_VERSION + 'orders';
  public static readonly GET_USER_ORDERS = Endpoint.API_BASE + Endpoint.API_VERSION + 'orders/my';
  public static readonly VERIFY_KHALTI_PAYMENT = Endpoint.API_BASE + Endpoint.API_VERSION + 'orders/verify-khalti';

  // Farmer
  public static readonly FARMER_PRODUCTS = Endpoint.API_BASE + Endpoint.API_VERSION + 'farmer/products';
  public static readonly FARMER_ORDERS = Endpoint.API_BASE + Endpoint.API_VERSION + 'farmer/orders';
  public static readonly FARMER_DASHBOARD_STATS = Endpoint.API_BASE + Endpoint.API_VERSION + 'farmer/dashboard/stats';
  public static readonly FARMER_REVENUE = Endpoint.API_BASE + Endpoint.API_VERSION + 'farmer/revenue';
  public static readonly FARMER_UPDATE_ORDER_STATUS = (orderId: string) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `farmer/orders/${orderId}/status`;
  public static readonly GET_CURRENT_USER = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/me';
  public static readonly UPDATE_PROFILE = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/profile';

  // Notifications
  public static readonly GET_NOTIFICATIONS = Endpoint.API_BASE + Endpoint.API_VERSION + 'notifications';
  public static readonly GET_UNREAD_COUNT = Endpoint.API_BASE + Endpoint.API_VERSION + 'notifications/unread-count';
  public static readonly MARK_NOTIFICATION_READ = (id: string) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `notifications/${id}/read`;
  public static readonly MARK_ALL_NOTIFICATIONS_READ = Endpoint.API_BASE + Endpoint.API_VERSION + 'notifications/read-all';
  public static readonly DELETE_NOTIFICATION = (id: string) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `notifications/${id}`;
}
