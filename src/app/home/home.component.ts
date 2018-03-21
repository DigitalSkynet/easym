import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor() { }

  oauth = {
    clientId: environment.asanaClientId,
    redirectUrl: environment.asanaRedirectUrl
  };
  asanaConnectUrl = `https://app.asana.com/-/oauth_authorize?client_id=${this.oauth.clientId}&redirect_uri=${this.oauth.redirectUrl}&response_type=token`;

  ngOnInit() {
  }

}
