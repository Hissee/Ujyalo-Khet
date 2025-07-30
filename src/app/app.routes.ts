import { Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { ContactComponent } from './contact/contact.component';
import { HomeComponent } from './home/home.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';


export const routes: Routes = [
    {path:'about',component: AboutComponent},
    {path:'login',component:LoginComponent},
    {path:'contact',component:ContactComponent},
    {path:'',component:HomeComponent},
    {path:'**',component:PagenotfoundComponent}


];
