import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { AppComponent, AgentStatus, AgentStatusColors } from '../app.component';
import { NavigationStart, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tabposessions',
  templateUrl: 'tabposessions.page.html',
  styleUrls: ['tabposessions.page.scss']
})
export class TabposessionsPage implements OnInit, AfterViewInit {

  public wallet = '';
  public search_status = 0; // 0 - not searched, 1 - nothing found, 2 - show results
  public results = [];
  public enchant_subjec = null;

  constructor(
    public rootApp: AppComponent,
    public router: Router,
    private route: ActivatedRoute,
  ) {
    console.log(AgentStatus[this.rootApp.wallet_status]);
    console.log(AgentStatus[this.rootApp.daemon_status]);
    this.wallet = this.rootApp.wallet_address;
  }

  private routeSub: any;  // subscription to route observer

  public ngAfterViewInit() {

  }

  ionViewWillEnter() {
    // console.log( this.route.snapshot.queryParamMap.get('enchant') );
    this.read_query_params();
    this.fetch_posessions();
  }

  async read_query_params() {
    console.log('read query params');
    try {
      this.enchant_subjec = null;
      const pos = ( window.location.search.split('=') );
      console.log( pos );
      if ( pos[0] === '?enchant' ) {
        const item = await this.rootApp.getPlanetFromBlockchain( pos[1] );
        if ( item !== null ) {
          item.i = 'enchant';
          this.enchant_subjec = item;
        }
        this.wallet = this.rootApp.wallet_address;
      } else if ( pos[0] === '?owner' ) {
        this.wallet = pos[1];
      } else {
        this.wallet = this.rootApp.wallet_address;
        // dERoX2QZwqRfqpaWa1mEUkZzeFzux5RnVdEgxtcHvgaWZ2cLJw6Vdxch2MwDkmhksS2RYWwEpXcCLd3SypaobAdg7WtWfrxE66
      }

    } catch (err) {
      // err
    }
  }

  async ngOnInit() {

    console.log('View Init');

  }

  public enchant(pos) {
    this.rootApp.enchant_card(pos);
    setTimeout( () => this.read_query_params() );
  }



/*
  public ngOnDestroy() {
    this.routeSub.unsubscribe();
  }

  public ngOnInit() {
    // Register to Angular navigation events to detect navigating away (so we can save changed settings for example)
    this.routeSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // this.saveEndpoints();
        // console.log('OnLeave', event);
        // this.results = [];
        // this.search_status = 0;
        // this.fetch_posessions();
        this.wallet = this.rootApp.wallet_address;
        this.fetch_posessions();
      }
    });
  }
*/
  public myHeaderFn(record, recordIndex, records) {
    if (recordIndex % 10 === 0) {
      return 'Showing records: ' + ( parseInt(recordIndex, 10) + 1 ) + ' - ' + (( parseInt(recordIndex, 10) ) + 10);
    }
    // initPlanet('planetFocus' + record.i, 140, record);
    return null;
  }

  public loadcanvas(id) {
    console.log(id);
  }

  public async fetch_posessions() {
    this.search_status = 0;
    this.results = [];
    const keys = [this.wallet + '_index'];
    const res = await this.rootApp.fetch_contract(keys, true);
    if ( res != null ) {
      // Blockchain got an actual data
      // Parse keys
      try {
        const contract_keys = res.txs[0].sc_keys;
        if ( contract_keys[this.wallet + '_index'] === '' ) {
          // nothing found
          this.search_status = 1;
        } else {
          const keys1 = [];
          let i = 0;
          for (i = 0; i < parseInt(contract_keys[this.wallet + '_index'], 10); i++) {
            keys1.push(this.wallet + '_index_' + i);
          }
          const res1 = await this.rootApp.fetch_contract(keys1, false);
          if ( res1 != null ) {
            // console.log( res1.txs[0].sc_keys );
            for (let j = 0; j < i; j++) {
              // console.log( res1.txs[0].sc_keys[this.wallet + '_index_' + j] );
              // this.results.push( res1.txs[0].sc_keys[this.wallet + '_index_' + j] );
              const item = await this.rootApp.getPlanetFromBlockchain( res1.txs[0].sc_keys[this.wallet + '_index_' + j] );
              // console.log( item );
              if ( item !== null ) {
                item.i = j;
                // initPlanet('planetFocus' + j, 140, item);
                this.results.push(item);
              }
            }
            this.search_status = 2;
          }

        }
      } catch (err) {
        this.search_status = 0;
        console.log(err);
        // none
      }
    }
  }

}
