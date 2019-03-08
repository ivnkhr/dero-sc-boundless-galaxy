import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppComponent, AgentStatus, AgentStatusColors } from '../app.component';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

  items: Observable<any[]>;

  values: any;

  constructor(
    public rootApp: AppComponent,
    public db: AngularFireDatabase,
    public storage: Storage,
  ) {
    console.log(AgentStatus[this.rootApp.wallet_status]);
    console.log(AgentStatus[this.rootApp.daemon_status]);
    this.items = db.list('general', ref => ref.orderByChild('ts').limitToLast(10) ).valueChanges();
  }

  public async ngOnInit() {
    this.values = {};
    this.values['sectors'] = await this.storage.get('sectors_discovered');
    this.values['total'] = await this.storage.get('total_discovered');
  }

  public refreshScreen() {
    this.ngOnInit();
    this.rootApp.nicks_list = {};
    this.rootApp.ping_daemon();
  }

}
