import { Routes } from '@angular/router';
import { AboutUsComponent } from './about-us/about-us.component';
import { SignupKhetaloComponent } from './signup-khetalo/signup-khetalo.component';
import { HomeComponent } from './home/home.component';
import { ProductListComponent } from './product-list/product-list.component';
import { LoginComponent } from './login/login.component';
import { ContactComponent } from './contact/contact.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';



export const routes: Routes = [
    {
        path:  '',
        pathMatch: 'full',
        component: HomeComponent
    },{
        path:  'about',
        component: AboutUsComponent
    },
    {
        path: 'signup/Khetalo',
        component: SignupKhetaloComponent
    },
    {
        path: 'product-list',
        component: ProductListComponent
    },
    {
        path:'login',
        component:LoginComponent
    },
    {
        path:'contact',
        component:ContactComponent
    },
    {
        path:'**',
        component:PagenotfoundComponent
    }
];
