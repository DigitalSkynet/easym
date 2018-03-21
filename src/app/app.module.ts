import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { AppComponent } from './app.component';
import { AsanaComponent } from './asana/asana.component';
import { OauthComponent } from './oauth/oauth.component';
import { AppRoutingModule } from './/app-routing.module';
import { OauthService } from './oauth.service';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    AsanaComponent,
    OauthComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule
  ],
  providers: [OauthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
