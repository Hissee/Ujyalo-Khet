import { SignupConsunerComponent } from './signup-consuner/signup-consuner.component';
import { Routes } from '@angular/router';
import { AboutUsComponent } from './about-us/about-us.component';
import { HomeComponent } from './home/home.component';
import { ProductListComponent } from './product-list/product-list.component';
import { LoginComponent } from './login/login.component';
import { ContactComponent } from './contact/contact.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { SignupFarmerComponent } from './signup-farmer/signup-farmer.component';
import { LoginFarmerComponent } from './login-farmer/login-farmer.component';


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
    path: 'signup-farmer',
    component: SignupFarmerComponent,
  },
  {
    path: 'signup-consumer',
    component: SignupConsunerComponent,
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
    path: '**',
    component: PagenotfoundComponent,
  },
];
