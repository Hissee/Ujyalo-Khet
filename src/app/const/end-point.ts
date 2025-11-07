import { environment } from '../environment/environment';

// src/app/constants/endpoint.ts
export class Endpoint {
  public static readonly API_BASE: string = environment.apiUrl;
  public static readonly API_VERSION: string = 'api/';

  // Auth
  public static readonly SIGNUP_CUSTOMER = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/signup/customer';
  public static readonly SIGNUP_FARMER = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/signup/farmer';
  public static readonly LOGIN = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/login';
  public static readonly VERIFY_EMAIL = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/verify-email';
  public static readonly RESEND_VERIFICATION = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/resend-verification';
  public static readonly FORGOT_PASSWORD = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/forgot-password';
  public static readonly RESET_PASSWORD = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/reset-password';
  public static readonly RESEND_PASSWORD_RESET_OTP = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/resend-password-reset-otp';
  public static readonly VERIFY_OTP = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/verify-otp';
  public static readonly RESEND_OTP = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/resend-otp';

  // Products
  public static readonly ADD_PRODUCT = Endpoint.API_BASE + Endpoint.API_VERSION + 'products';
  public static readonly GET_ALL_PRODUCTS = Endpoint.API_BASE + Endpoint.API_VERSION + 'products';
  public static readonly GET_PRODUCT_BY_ID = (id: string) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `products/${id}`;
  public static readonly UPDATE_PRODUCT = (id: string) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `products/${id}`;
  public static readonly DELETE_PRODUCT = (id: string) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `products/${id}`;
  public static readonly SUGGEST_PRICE = Endpoint.API_BASE + Endpoint.API_VERSION + 'products/suggest-price';
  public static readonly CATEGORY_STATS = (category: string) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `products/category-stats/${category}`;

  // Orders
  public static readonly PLACE_ORDER = Endpoint.API_BASE + Endpoint.API_VERSION + 'orders';
  public static readonly GET_USER_ORDERS = Endpoint.API_BASE + Endpoint.API_VERSION + 'orders/my';

  // Farmer
  public static readonly FARMER_PRODUCTS = Endpoint.API_BASE + Endpoint.API_VERSION + 'farmer/products';
  public static readonly FARMER_ORDERS = Endpoint.API_BASE + Endpoint.API_VERSION + 'farmer/orders';
  public static readonly FARMER_DASHBOARD_STATS = Endpoint.API_BASE + Endpoint.API_VERSION + 'farmer/dashboard/stats';
  public static readonly FARMER_REVENUE = Endpoint.API_BASE + Endpoint.API_VERSION + 'farmer/revenue';
  public static readonly FARMER_UPDATE_ORDER_STATUS = (orderId: string) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `farmer/orders/${orderId}/status`;
  public static readonly GET_CURRENT_USER = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/me';
  public static readonly UPDATE_PROFILE = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/profile';
  public static readonly REQUEST_PASSWORD_CHANGE_OTP = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/password/request-otp';
  public static readonly CHANGE_PASSWORD_WITH_OTP = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/password/change-with-otp';
  public static readonly DEACTIVATE_ACCOUNT = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/deactivate';
  public static readonly DELETE_ACCOUNT = Endpoint.API_BASE + Endpoint.API_VERSION + 'auth/delete-account';

  // Notifications
  public static readonly GET_NOTIFICATIONS = Endpoint.API_BASE + Endpoint.API_VERSION + 'notifications';
  public static readonly GET_UNREAD_COUNT = Endpoint.API_BASE + Endpoint.API_VERSION + 'notifications/unread-count';
  public static readonly MARK_NOTIFICATION_READ = (id: string) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `notifications/${id}/read`;
  public static readonly MARK_ALL_NOTIFICATIONS_READ = Endpoint.API_BASE + Endpoint.API_VERSION + 'notifications/read-all';
  public static readonly DELETE_NOTIFICATION = (id: string) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `notifications/${id}`;

  // Upload
  public static readonly UPLOAD_SINGLE_IMAGE = Endpoint.API_BASE + Endpoint.API_VERSION + 'upload/single';
  public static readonly UPLOAD_MULTIPLE_IMAGES = Endpoint.API_BASE + Endpoint.API_VERSION + 'upload/multiple';
  public static readonly DELETE_IMAGE = (publicId: string) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `upload/${publicId}`;

  // Locations (Nepal Administrative Divisions)
  public static readonly GET_PROVINCES = Endpoint.API_BASE + Endpoint.API_VERSION + 'locations/provinces';
  public static readonly GET_DISTRICTS_BY_PROVINCE = (provinceId: number) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `locations/provinces/${provinceId}/districts`;
  public static readonly GET_MUNICIPALITIES_BY_DISTRICT = (districtId: number) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `locations/districts/${districtId}/municipalities`;
  public static readonly GET_WARDS_BY_MUNICIPALITY = (municipalityId: number) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `locations/municipalities/${municipalityId}/wards`;
  public static readonly GET_ALL_LOCATIONS = Endpoint.API_BASE + Endpoint.API_VERSION + 'locations/all';

  // Comments
  public static readonly GET_COMMENTS_BY_PRODUCT = (productId: string) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `comments/product/${productId}`;
  public static readonly ADD_COMMENT = Endpoint.API_BASE + Endpoint.API_VERSION + 'comments';
  public static readonly UPDATE_COMMENT = (commentId: string) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `comments/${commentId}`;
  public static readonly DELETE_COMMENT = (commentId: string) =>
    Endpoint.API_BASE + Endpoint.API_VERSION + `comments/${commentId}`;

}
