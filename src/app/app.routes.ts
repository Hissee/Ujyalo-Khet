import { Routes } from '@angular/router';
import { AboutUsComponent } from './about-us/about-us.component';
import { SignupKhetaloComponent } from './signup-khetalo/signup-khetalo.component';
import { HomeComponent } from './home/home.component';
<<<<<<< HEAD
import { ProductListComponent } from './product-list/product-list.component';
=======
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { ContactComponent } from './contact/contact.component';
import { HomeComponent } from './home/home.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';

>>>>>>> eb713a56792ba2ef718409b9f5d944ab832720ec

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
    }
];
export const routes: Routes = [
    {path:'about',component: AboutComponent},
    {path:'login',component:LoginComponent},
    {path:'contact',component:ContactComponent},
    {path:'',component:HomeComponent},
    {path:'**',component:PagenotfoundComponent}


];
