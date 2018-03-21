import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OauthComponent } from './oauth/oauth.component';
import { AsanaComponent } from './asana/asana.component';
import { environment } from './../environments/environment';
import { HomeComponent } from './home/home.component';


const appRoutes: Routes = [
  { path: 'oauth-asana', component: OauthComponent, pathMatch: 'prefix' },
  { path: 'asana', component: AsanaComponent },
  { path: '', component: HomeComponent }
];


@NgModule({
  exports: [ RouterModule ],
  imports: [
    RouterModule.forRoot(appRoutes,
      {
        enableTracing: !environment.production,
        useHash: false
      }),
  ]
})
export class AppRoutingModule {}
