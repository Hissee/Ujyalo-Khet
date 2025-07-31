import { Routes } from '@angular/router';
import { AboutUsComponent } from './about-us/about-us.component';
import { SignupKhetaloComponent } from './signup-khetalo/signup-khetalo.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { ContactComponent } from './contact/contact.component';
import { HomeComponent } from './home/home.component';
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
        path:'**',
        component:PagenotfoundComponent
    },
    {
        path:'contact',
        component:ContactComponent
    },
        
    {
        path:'login',
        component:LoginComponent
    }

];

