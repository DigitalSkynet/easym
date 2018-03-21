import { Component, OnInit } from '@angular/core';
import * as AsanaApi from 'asana-api';
import { OauthService } from '../oauth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asana',
  templateUrl: './asana.component.html',
  styleUrls: ['./asana.component.scss']
})
export class AsanaComponent implements OnInit {

  constructor(oauthService: OauthService, router: Router) {
    this.oauthData = oauthService.getAsanaData();
    this.router = router;

    if (this.oauthData != null) {
      this.client = AsanaApi.createClient({
        token: this.oauthData['#access_token']
      });
    } else {
      this.handleRefreshToken();
    }
  }

  router: Router = null;
  asanaUsers = [];
  workspaces = [];
  loading = false;
  client = null;
  oauthData = null;
  oauth = {
    clientId: '598248304930817',
    redirectUrl: 'https://easym-dev.com:4200/oauth/callback'
  };
  asanaConnectUrl = `https://app.asana.com/-/oauth_authorize?client_id=${this.oauth.clientId}&redirect_uri=${this.oauth.redirectUrl}&response_type=token`;

  that = this;

  handleRefreshToken() {
    this.router.navigate(['']);
  }

  sortTasks(a, b) {
    let aId = 0;
    let bId = 0;

    if (a.projects[0]) {
      aId = a.projects[0];
    }

    if (b.projects[0]) {
      bId = b.projects[0];
    }

    return aId > bId;
  }

  loadTasks(workspace) {
    const that = this;
    const query = {
      'workspace': workspace.id,
      'completed_since': 'now',
      'assignee': 'me',
      'opt_fields': 'id,name,created_at,completed,projects,tags,due_on,custom_fields'
    };
    this.client.workspaces.tasks(query, function (errTasks, tasks) {
      workspace.tasks = tasks.sort((a, b) => that.sortTasks(a, b));
    });
  }

  loadWorspaces() {
    const that = this;
    that.loading = true;
    this.client.workspaces.list(function (err, workspaces) {
      if (workspaces) {
        for (const workspace of workspaces) {
          that.loadTasks(workspace);
        }
        that.workspaces = workspaces;
      } else {
        that.handleRefreshToken();
      }
      that.loading = false;
    });
  }

  ngOnInit() {
    const that = this;
    this.loadWorspaces();
  }
}
