import { Component, OnInit } from '@angular/core';
import * as AsanaApi from 'asana-api';
import { OauthService } from '../oauth.service';
import { Router } from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

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
  users = [];
  currentUser = null;
  me = null;
  workspaces = [];
  loading = false;
  client = null;
  showEmptyWorkspaces: false;
  infoMessage = '';
  infoWorkspacesLoaded = 0;
  oauthData = null;
  oauth = {
    clientId: '598248304930817',
    redirectUrl: 'https://easym-dev.com:4200/oauth/callback'
  };
  asanaConnectUrl = `https://app.asana.com/-/oauth_authorize?client_id=${this.oauth.clientId}&redirect_uri=${this.oauth.redirectUrl}&response_type=token`;

  isWorkspaceVisible(workspace) {
    return this.showEmptyWorkspaces || workspace && workspace.tasks && workspace.tasks.length && !workspace.notMember;
  }

  handleRefreshToken() {
    this.router.navigate(['']);
  }

  private sort(a, b) {
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    return 0;
  }

  private sortTasks(a, b) {
    let aId = 0;
    let bId = 0;

    if (a.due) {
      aId = a.due.getTime();
    }

    if (b.due) {
      bId = b.due.getTime();
    }

    return this.sort(bId, aId);
  }

  private sortWorkspaces(a, b) {
    let aId = a.tasks.length;
    let bId = b.tasks.length;

    if (a.notMember) {
      aId--;
    }

    if (b.notMember) {
      bId--;
    }

    return this.sort(bId, aId);
  }

  loadTasksForAllWorkspaces() {
    const tasksPromises = [];
    const that = this;
    that.loading = true;
    that.infoMessage = `Loading tasks...`;
    that.infoWorkspacesLoaded = 0;
    for (const workspace of this.workspaces) {
      const taskPromise = this.loadTasks(workspace);
      tasksPromises.push(taskPromise);
    }
    Promise.all(tasksPromises).then(value => {
      that.loading = false;
      that.workspaces = that.workspaces.sort((a, b) => that.sortWorkspaces(a, b));
      that.infoMessage = `Sorting workspaces...`;
    }, reason => {
      that.loading = false;
        that.handleRefreshToken();
    });
  }

  loadTasks(workspace) {
    const that = this;
    const query = {
      'workspace': workspace.id,
      'completed_since': 'now',
      'assignee': that.currentUser.id,
      'opt_fields': 'id,name,created_at,completed,projects,tags,due_on,due_at,custom_fields'
    };
    workspace.notMember = false;
    workspace.tasks = [];

    const tasksPromise = new Promise((resolve, reject) => {
      this.client.workspaces.tasks(query, function (errTasks, tasks) {
        that.infoWorkspacesLoaded++;
        that.infoMessage = `Loading tasks ${that.infoWorkspacesLoaded}/${that.workspaces.length}...`;
        if (tasks) {
          tasks.forEach(task => {
            const now = new Date();
            if (task.due_on) {
              let date = task.due_on;
              if (task.due_at) {
                date = task.due_at;
              }
              task.due = new Date(Date.parse(date));
              if (!task.due_at) {
                task.due.setHours(23, 59, 59, 999);
              }

              if (now < task.due) {
                task.dueClass = 'upcomming';
              } else {
                task.dueClass = 'overdue';
              }
            }
          });
          workspace.tasks = tasks.sort((a, b) => that.sortTasks(a, b));
          resolve();
        } else {
          const errorMessage = errTasks.result.errors[0].message;
          if (errorMessage.startsWith('assignee: Not a recognized ID:')) {
            workspace.notMember = true;
            resolve();
          } else {
            reject();
          }
        }
      });
    });

    return tasksPromise;
  }

  loadWorspaces() {
    const that = this;
    const workspacesPromise = new Promise((resolve, reject) => {
      this.client.workspaces.list(function (err, workspaces) {
        if (workspaces) {
          that.workspaces = workspaces;
          resolve();
        } else {
          reject(err);
        }
      });
    });

    return workspacesPromise;
  }

  loadUsers() {
    const that = this;
    that.loading = true;
    that.infoMessage = 'Loading users...';
    that.client.users.me(function (errMe, me) {
      that.me = me;
      that.client.users.list(function(err, users) {
        if (users) {
          that.users = users;
          const user = users.filter(x => x.id === me.id)[0];
          that.infoMessage = 'Users are loaded!';
          that.changeUser(user);
        } else {
          that.handleRefreshToken();
        }
      });
    });
  }

  changeUser(user) {
    if (user != null) {
      if (this.currentUser == null || this.currentUser.id !== user.id) {
        this.currentUser = user;
        this.loadTasksForAllWorkspaces();
      }
    } else {
      alert('User not found');
    }
  }

  ngOnInit() {
    const that = this;
    that.loading = true;
    that.infoMessage = 'Loading workspaces...';
    that.loadWorspaces().then(function(response) {
      that.infoMessage = 'Workspaces are loaded!';
      that.loadUsers();
    }, function(error) {
      that.loading = false;
      that.handleRefreshToken();
    });
  }
}
