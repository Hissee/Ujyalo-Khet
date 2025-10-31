export interface UserDetail {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  province: string;
  city: string;
  street: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  province: string;
  city: string;
  street: string;
  password: string;
}
