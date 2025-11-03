import { Routes } from '@angular/router';
import { AboutUsComponent } from './about-us/about-us.component';
import { HomeComponent } from './home/home.component';
import { ProductListComponent } from './product/product-list/product-list.component';
import { LoginComponent } from './login/login.component';
import { ContactComponent } from './contact/contact.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { ProductDetailsComponent } from './product/product-details/product-details.component';
import { SignupFarmerComponent } from './signup-component/signup-farmer/signup-farmer.component';
import { LoginFarmerComponent } from './login-farmer/login-farmer.component';
import { SignupComponent } from './signup-component/signup/signup.component';
import {SignupConsumerComponent} from './signup-component/signup-consumer/signup-consumer.component';
import { CartComponent } from './cart/cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { FarmerDashboardComponent } from './farmer/farmer-dashboard/farmer-dashboard.component';
import { EditAccountComponent } from './edit-account/edit-account.component';
import { OrderListComponent } from './order/order-list/order-list.component';
import { OrderDetailComponent } from './order/order-detail/order-detail.component';
import { UpdateProductComponent } from './product/update-product/update-product.component';
import { AddProductComponent } from './product/add-product/add-product.component';
import { NotificationComponent } from './notification/notification.component';
import { FilterComponent } from './product/filter/filter.component';


export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
  },
  {
    path: 'about',
    component: AboutUsComponent,
  },
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: 'signup-farmer',
    component: SignupFarmerComponent,
  },
  {
    path: 'signup-consumer',
    component: SignupConsumerComponent,
  },
  {
    path: 'product-list',
    component: ProductListComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'contact',
    component: ContactComponent,
  },
  {
    path: 'view-product/:id',
    component: ProductDetailsComponent,
  },
  {
    path: 'login-farmer',
    component: LoginFarmerComponent,
  },
  {
    path: 'cart',
    component: CartComponent,
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
  },
  {
    path: 'farmer-dashboard',
    component: FarmerDashboardComponent,
  },
  {
    path: 'addproduct',
    component: AddProductComponent,
  },
  {
    path: 'updateproduct',
    component: UpdateProductComponent,
  },
  {
    path: 'edit-account',
    component: EditAccountComponent,
  },
  {
    path: 'orders',
    component: OrderListComponent,
  },
  {
    path: 'orders/:id',
    component: OrderDetailComponent,
  },
  {
    path: 'notifications',
    component: NotificationComponent,
  },
  {
    path: 'filter',
    component: FilterComponent,
  },
  {
    path: '**',
    component: PagenotfoundComponent,
  },
];
