import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OauthService } from '../oauth.service';

@Component({
  selector: 'app-oauth',
  templateUrl: './oauth.component.html',
  styleUrls: ['./oauth.component.scss']
})

export class OauthComponent implements OnInit {

  constructor(router: Router, oauthService: OauthService) {
    const json = this.getJsonFromUrl(true);
    oauthService.setAsanaData(json);
    router.navigate(['asana']);
  }

  getJsonFromUrl(hashBased) {
    let query;
    if (hashBased) {
      const pos = location.href.indexOf('?');
      if (pos === -1) {
        query = location.hash;
      } else {
        query = location.href.substr(pos + 1);
      }
    } else {
      query = location.search.substr(1);
    }
    const result = {};
    query.split('&').forEach(function(part) {
      if (!part) {
        return;
      }
      part = part.split('+').join(' '); // replace every + with space, regexp-free version
      const eq = part.indexOf('=');
      let key = eq > -1 ? part.substr(0, eq) : part;
      const val = eq > -1 ? decodeURIComponent(part.substr(eq + 1)) : '';
      const from = key.indexOf('[');
      if (from === -1) {
        result[decodeURIComponent(key)] = val;
      } else {
        const to = key.indexOf(']', from);
        const index = decodeURIComponent(key.substring(from + 1, to));
        key = decodeURIComponent(key.substring(0, from));
        if (!result[key]) {
          result[key] = [];
        }
        if (!index) {
          result[key].push(val);
        } else {
          result[key][index] = val;
        }
      }
    });
    return result;
  }

  ngOnInit() {
  }


}
