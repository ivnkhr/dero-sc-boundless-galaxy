import { Component } from '@angular/core';
import { AppComponent, AgentStatus, AgentStatusColors } from '../app.component';

@Component({
  selector: 'app-tabposessions',
  templateUrl: 'tabposessions.page.html',
  styleUrls: ['tabposessions.page.scss']
})
export class TabposessionsPage {

  public wallet = '';
  public search_status = 0; // 0 - not searched, 1 - nothing found, 2 - show results
  public results = [];

  constructor(public rootApp: AppComponent) {
    console.log(AgentStatus[this.rootApp.wallet_status]);
    console.log(AgentStatus[this.rootApp.daemon_status]);
    this.wallet = this.rootApp.wallet_address;
  }

  public async fetch_posessions() {
    this.search_status = 0;
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
          keys = [];
          for (i = 0; i < parseInt(contract_keys[this.wallet + '_index'], 10); i++) {
            keys.push(this.wallet + '_index_' + i);
          }
          const res1 = await this.rootApp.fetch_contract(keys, true);
          if ( res1 != null ) {
            // console.log( res.txs[0].sc_keys );
            for (i = 0; i < res.txs[0].sc_keys.length; i++) {
              this.results.push(await this.rootApp.getPlanetFromBlockchain(res.txs[0].sc_keys[i]));
            }
          }

        }
      } catch (err) {
        this.search_status = 0;
        // none
      }
    }
  }

}
