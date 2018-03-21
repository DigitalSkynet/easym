import { Injectable } from '@angular/core';

@Injectable()
export class OauthService {

  constructor() { }
  private asanaAuthKey = 'asana-oauth';

  setAsanaData(data) {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(this.asanaAuthKey, jsonData);
  }

  getAsanaData() {
    const jsonData = localStorage.getItem(this.asanaAuthKey);
    const data = JSON.parse(jsonData);
    return data;
  }
}
