import { Component, ChangeDetectorRef, HostListener } from '@angular/core';

import { Storage } from '@ionic/storage';
import { Platform, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { ModalExample } from '../modal/modal.page';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';
// const bigInt = require('big-integer');

export enum AgentStatus {
   checking = 1,
   notsynced = 2,
   ready = 3,
   offline = 0
}

export enum AgentStatusColors {
   warning = 1,
   secondary = 2,
   success = 3,
   danger = 0
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private router: Router,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public storage: Storage,
    private http: HttpClient,
    public modalController: ModalController,
    public loadingController: LoadingController,
    public toastController: ToastController,
    public alertController: AlertController,
    private cdRef: ChangeDetectorRef,
    public db: AngularFireDatabase
  ) {
    this.initializeApp();
  }

  public wallet: any = '';
  public daemon: any = '';

  public wallet_status: any = 0; // Disconnected / Checking / Not Synced / Ready
  public daemon_status: any = 0; // Disconnected / Checking / Not Synced / Ready

  public wallet_response = null;
  public daemon_response = null;
  public wallet_execution_response = null;
  public wallet_address = '';

  public settings_laoded: any = <any>{
    variable_colonize_fee:    '1000000000000',
    variable_sector_moto_fee: '500000000000', // Default value, may vary
    variable_dev_fee:         '5',
    variable_redeem_offset:   '50',
    variable_redeem_precent:  '25',
    variable_enchant_precent: '40',

    stats_excelent_cards:     '0',
    stats_planet_counter:     '0',

    balance_dev_fee:          '0',
    balance_shared_pool:      '0',
    admin:                    'none'
  };

  public latest_tx_count = 0;
  public latest_txs = [];

  public contract = '7b742e23a8a5c125f7364f583ae9478ddbd9cb9e18526e5c8694e4c99ac1f90f';
  public contract_response = null;
  public variables = [''];
  public active_method = null;
  public command = {};
  public soundList = {};

  public nicks_list = {};

  public chat_message = '';

  public loadingState = null;
  public block_timer = null;

  // TODO Admin capabilities
  // AdminSetVariable

  @HostListener('document:keyup', ['$event'])
    async handleDeleteKeyboardEvent(event: KeyboardEvent) {
      if (event.key === 'Home') {

        const alert = await this.alertController.create({
          header: 'Admin Features',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'warning',
              handler: () => {
                console.log('Confirm Cancel');
              }
            }, {
              text: 'AdminSetVariable',
              handler: (ev) => {
                this.adminSetVar();
              }
            }
          ]
        });

        await alert.present();

      }
    }

  async adminSetVar() {

    const alert = await this.alertController.create({
      header: 'AdminSetVariable',
      inputs: [
        {
          name: 'variable',
          type: 'text',
          placeholder: 'Enter variable name (without variable_)...'
        },
        {
          name: 'new_value',
          type: 'text',
          placeholder: 'Enter new value...'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'warning',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Proceed',
          handler: (ev) => {
            this.execute_command('AdminSetVariable', ev, 0);
          }
        }
      ]
    });

    await alert.present();

  }

  public sendMessage(room, message) {
    if ( this.chat_message.length > 0 ) {
      this.db.list(room).push({
        address: this.wallet_address,
        message: message,
        ts: new Date().getTime()
      });
      this.chat_message = '';
    }
  }

  async redeem(planet) {
    await this.execute_command('PlanetRedeem', {
      position_x: planet.x,
      position_y: planet.y,
      position_z: planet.z,
    }, 0);

    // console.log(planet, this.daemon_response.result.stableheight, this.settings_laoded.variable_redeem_offset);
    try {
      planet.next_redeem_at = parseInt(this.daemon_response.result.stableheight, 10)
      + parseInt(this.settings_laoded.variable_redeem_offset, 10);
    } catch (err) {
      // err
    }
  }

  async withdraw() {
    await this.execute_command('ErrorValueWithdraw', {
    }, 0);
  }

  async flame(planet1, planet2) {

    const alert = await this.alertController.create({
      header: 'Enchantment',
      cssClass: 'flame',
      message: '<i>Warning !</i>'
      + '<br/><b>' + planet2.Name + '</b> card will be <i>destroyed</i> and its atributes will empower <b>' + planet1.Name + '</b> card',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'warning',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Proceed',
          handler: (ev) => {

            this.execute_command('PlanetMerge', {
              planet1_x: planet1.x,
              planet1_y: planet1.y,
              planet1_z: planet1.z,
              planet2_x: planet2.x,
              planet2_y: planet2.y,
              planet2_z: planet2.z,
            }, 0);

          }
        }
      ]
    });

    await alert.present();

  }
  // putOnSell

  async donate() {
    const alert = await this.alertController.create({
      header: 'Enter amount you want to donate <3',
      inputs: [
        {
          name: 'price',
          type: 'number',
          placeholder: 'Enter amount you want to donate (in DERO)...'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'warning',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Proceed',
          handler: (ev) => {
            if ( ev.price > 0 ) {
              this.execute_command('Donate', {

              }, ev.price * 1000000000000);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async putOnSell(planet) {
    const alert = await this.alertController.create({
      header: 'Set price for this Card. Setting 0 will remove card from sale.',
      inputs: [
        {
          name: 'price',
          type: 'number',
          placeholder: 'Enter new price (in DERO)...'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'warning',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Proceed',
          handler: (ev) => {
            if ( ev.price >= 0 ) {
              this.execute_command('PlanetSellOut', {
                position_x: planet.x,
                position_y: planet.y,
                position_z: planet.z,
                price: ev.price * 1000000000000
              }, 0);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async putOnBuy(planet) {
    this.execute_command('PlanetBuyIn', {
      position_x: planet.x,
      position_y: planet.y,
      position_z: planet.z,
    }, planet.OnSale);
  }

  async setNewName() {
    const alert = await this.alertController.create({
      header: 'Provide new Nickname',
      inputs: [
        {
          name: 'new_name',
          type: 'text',
          placeholder: 'Enter new name...'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'warning',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Proceed',
          handler: (ev) => {
            if ( ev.new_name.length > 0 ) {
              this.execute_command('UserSetAlias', ev, 0);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async setSectorMoto(x, y) {
    const alert = await this.alertController.create({
      header: 'Provide new Moto for this sector [' + x + ':' + y + ']',
      inputs: [
        {
          name: 'moto',
          type: 'text',
          placeholder: 'Enter new moto...'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'warning',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Proceed',
          handler: (ev) => {
            if ( ev.moto.length > 0 ) {
              this.execute_command('SectorSetMoto', {
                sector_x: this.onChain_position(x),
                sector_y: this.onChain_position(y),
                moto: ev.moto
              }, this.settings_laoded.variable_sector_moto_fee);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async editPlanet(planet) {
    const alert = await this.alertController.create({
      header: 'Provide new Moto for this planet: ' + planet.Name,
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: planet.Name,
          placeholder: 'Enter new planet name...'
        },
        {
          name: 'moto',
          type: 'text',
          value: planet.Moto,
          placeholder: 'Enter new planet description...'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'warning',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Proceed',
          handler: (ev) => {
            if ( ev.moto.length > 0 && ev.moto.length > 0 ) {
              this.execute_command('PlanetSetDesc', {
                position_x: planet.x,
                position_y: planet.y,
                position_z: planet.z,
                moto: ev.moto,
                name: ev.name
              }, 0);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async presentLoadingWithOptions(text) {
    this.loadingState = await this.loadingController.create({
      spinner: 'crescent',
      duration: 6000,
      message: text,
      translucent: false,
      // cssClass: 'custom-class custom-loading'
    });
    // console.log();
    await this.loadingState.present();
    return this.loadingState;
  }

  async onHookLoading() {
    console.log(this.loadingState);
    if ( this.loadingState != null ) { return await this.loadingState.dismiss(); }
    return;
  }

  public onChain_position(pos) {
    const position = ( 500000000000000 ) + ( parseInt(pos, 10) );
    return position;
  }

  public onChain_value(full_dero) {
    return full_dero / 1000000000000; // 1000000000000
  }

  public display_avarage_reward() {
    if ( this.settings_laoded ) {
      const excel_cards = (this.settings_laoded.stats_excelent_cards === '0') ? 1 : this.settings_laoded.stats_excelent_cards;
      // console.log(this.settings_laoded.balance_shared_pool, excel_cards, this.settings_laoded.variable_redeem_precent);
      return this.onChain_value(
        (
          (this.settings_laoded.balance_shared_pool / (parseInt(excel_cards, 10) + 0))
        * this.settings_laoded.variable_redeem_precent ) / 100
      ).toFixed(5);
    } else {
      return 'Not Calculated';
    }
    // 10 LET reward = ((LOAD("balance_shared_pool") / (LOAD("stats_excelent_cards") + 1) ) * LOAD('variable_redeem_precent')) / 100
  }

  public display_redeemable_in(planet_focus) {
    if ( this.daemon_response && this.daemon_response.result && planet_focus ) {
      // next_redeem_at
      return parseInt(planet_focus.next_redeem_at, 10) - this.daemon_response.result.stableheight;
    }
    return 'Never';
  }

  public run_block_timer() {
    try {
      window.clearInterval(this.block_timer);
      this.block_timer = window.setInterval( () => {
        console.log('increment block');
        this.daemon_response.result.stableheight += 1;
      }, this.daemon_response.result.averageblocktime50 * 1000 );
    } catch (err) {
      // err
    }
  }

  public display_nickname(address) {
    if ( address == null || typeof( address ) === 'undefined' ) {
      return '';
    }
    if ( address === '' ) {
      return 'Anonymous';
    }
    if ( typeof( this.nicks_list[address] ) !== 'undefined' && this.nicks_list[address] !== '#loading#' ) {
      return '' + this.nicks_list[address];
    } else if ( typeof( this.nicks_list[address] ) !== 'undefined' && this.nicks_list[address] === '#loading#' ) {
      return 'loading...';
    } else {
      this.initNickloadingProcess(address);
      return 'loading...';
    }
  }

  public initNickloadingProcess(address) {
    console.log('initNickloadingProcess', address);
    this.nicks_list[address] = '#loading#';
    const params = {'txs_hashes': [this.contract], 'sc_keys': [address + '_nick']};
    this.http.post(this.daemon + '/gettransactions', JSON.stringify(params))
    .toPromise()
    .then(responseAfterSuccess => {
      if (responseAfterSuccess && responseAfterSuccess['status'] === 'OK') {
        // console.log(responseAfterSuccess.txs[0].sc_keys[address + '_nick']);
        let responseData: any = <any>{};
        responseData = responseAfterSuccess;
        this.nicks_list[address] = responseData.txs[0].sc_keys[address + '_nick'];
        if (this.nicks_list[address] === '') {
          this.nicks_list[address] = 'Unknown';
        }
      }
    });
  }

  public async getPlanetFromBlockchainXYZ(x, y, z) {
    return await this.getPlanetFromBlockchain('' + this.onChain_position(x) + ':' + this.onChain_position(y) + ':' + z + '');
  }

  public enchant_card(pos) {
    // alert(pos);
    // console.log('pre nav', pos);
    this.router.navigate(['/app/tabposessions'], {queryParams: {enchant: pos}});
  }

  public view_owner(pos) {
    // alert(pos);
    // console.log('pre nav', pos);
    this.router.navigate(['/app/tabposessions'], {queryParams: {owner: pos}});
  }

  public async getPlanetFromBlockchain(pos) {
    // return null;

    // Fill in dataArray
    // Build nessesary sc_keys
    const keys = [];
    let planet_pos = '';
    planet_pos = pos; // '' + this.onChain_position(x) + ':' + this.onChain_position(y) + ':' + z + '';

    // console.log( planet_pos );

    keys.push(planet_pos + '/Mass');
    keys.push(planet_pos + '/Population');
    keys.push(planet_pos + '/AvgTemp');

    keys.push(planet_pos + '/OnSale');
    keys.push(planet_pos + '/Name');
    keys.push(planet_pos + '/Moto');
    keys.push(planet_pos + '/Owner');

    keys.push(planet_pos + '/RARECloudiness');
    keys.push(planet_pos + '/RARECold');
    keys.push(planet_pos + '/RAREOcean');
    keys.push(planet_pos + '/RARETemperate');
    keys.push(planet_pos + '/RAREWarm');
    keys.push(planet_pos + '/RAREHot');
    keys.push(planet_pos + '/RARESpeckle');
    keys.push(planet_pos + '/RAREClouds');
    keys.push(planet_pos + '/RARELightColor');

    keys.push(planet_pos + '/vWaterLevel');
    keys.push(planet_pos + '/vRivers');
    keys.push(planet_pos + '/vTemperature');
    keys.push(planet_pos + '/vCloudiness');

    keys.push(planet_pos + '/vCold_r');
    keys.push(planet_pos + '/vCold_g');
    keys.push(planet_pos + '/vCold_b');

    keys.push(planet_pos + '/vOcean_r');
    keys.push(planet_pos + '/vOcean_g');
    keys.push(planet_pos + '/vOcean_b');

    keys.push(planet_pos + '/vTemperate_r');
    keys.push(planet_pos + '/vTemperate_g');
    keys.push(planet_pos + '/vTemperate_b');

    keys.push(planet_pos + '/vWarm_r');
    keys.push(planet_pos + '/vWarm_g');
    keys.push(planet_pos + '/vWarm_b');

    keys.push(planet_pos + '/vHot_r');
    keys.push(planet_pos + '/vHot_g');
    keys.push(planet_pos + '/vHot_b');


    keys.push(planet_pos + '/vSpeckle_r');
    keys.push(planet_pos + '/vSpeckle_g');
    keys.push(planet_pos + '/vSpeckle_b');

    keys.push(planet_pos + '/vClouds_r');
    keys.push(planet_pos + '/vClouds_g');
    keys.push(planet_pos + '/vClouds_b');

    keys.push(planet_pos + '/vLightColor_r');
    keys.push(planet_pos + '/vLightColor_g');
    keys.push(planet_pos + '/vLightColor_b');

    keys.push(planet_pos + '/vHaze_r');
    keys.push(planet_pos + '/vHaze_g');
    keys.push(planet_pos + '/vHaze_b');

    keys.push(planet_pos + '/fixtures01');
    keys.push(planet_pos + '/fixtures02');
    keys.push(planet_pos + '/fixtures03');
    keys.push(planet_pos + '/fixtures04');
    keys.push(planet_pos + '/fixtures05');
    keys.push(planet_pos + '/fixtures06');
    keys.push(planet_pos + '/fixtures07');
    keys.push(planet_pos + '/fixtures08');
    keys.push(planet_pos + '/fixtures09');

    keys.push(planet_pos + '/vAngle');
    keys.push(planet_pos + '/vRotspeed');

    // keys.push(planet_pos + '/index_in_stack');
    keys.push(planet_pos + '/txid');
    keys.push(planet_pos + '/planet_position');
    keys.push(planet_pos + '/card_power');
    keys.push(planet_pos + '/created_at');
    keys.push(planet_pos + '/next_redeem_at');

    const setoff: any = <any>{};

    const res = await this.fetch_contract(keys, false, true);
    if ( res != null ) {
      // Blockchain got an actual data
      // Parse keys per planet
      try {
        const contract_keys = res.txs[0].sc_keys;
        // console.log(contract_keys);
        // build contract from response
        Object.keys(contract_keys).forEach(function(key) {

          // console.log(key, contract_keys[key]);
          const key_split = key.split('/')[1];
          if (
            key_split !== 'Name' &&
            key_split !== 'Moto' &&
            key_split !== 'planet_position' &&
            key_split !== 'txid' &&
            key_split !== 'Owner'
          ) {
            setoff[key_split] = +contract_keys[key];
          } else {
            setoff[key_split] = contract_keys[key];
          }

        });
        /*
        setoff.RARECloudiness = 95;
        setoff.RARECold = 98;
        setoff.RAREOcean = 95;
        setoff.RARETemperate = 99;
        setoff.RAREWarm = 95;
        setoff.RAREHot = 100;
        setoff.RARESpeckle = 100;
        setoff.RAREClouds = 99;
        setoff.RARELightColor = 99;
        */
        setoff.RARECloudiness = (+setoff.RARECloudiness >= 100 ) ? 100 : +setoff.RARECloudiness;
        setoff.RARECold = (+setoff.RARECold >= 100 ) ? 100 : +setoff.RARECold;
        setoff.RAREOcean = (+setoff.RAREOcean >= 100 ) ? 100 : +setoff.RAREOcean;
        setoff.RARETemperate = (+setoff.RARETemperate >= 100 ) ? 100 : +setoff.RARETemperate;
        setoff.RAREWarm = (+setoff.RAREWarm >= 100 ) ? 100 : +setoff.RAREWarm;
        setoff.RAREHot = (+setoff.RAREHot >= 100 ) ? 100 : +setoff.RAREHot;
        setoff.RARESpeckle = (+setoff.RARESpeckle >= 100 ) ? 100 : +setoff.RARESpeckle;
        setoff.RAREClouds = (+setoff.RAREClouds >= 100 ) ? 100 : +setoff.RAREClouds;
        setoff.RARELightColor = (+setoff.RARELightColor >= 100 ) ? 100 : +setoff.RARELightColor;

        setoff.RAREPowers = <any>{};
        setoff.RAREPowers['RARECloudiness'] = setoff.RARECloudiness;
        setoff.RAREPowers['RARECold'] = setoff.RARECold;
        setoff.RAREPowers['RAREOcean'] = setoff.RAREOcean;
        setoff.RAREPowers['RARETemperate'] = setoff.RARETemperate;
        setoff.RAREPowers['RAREWarm'] = setoff.RAREWarm;
        setoff.RAREPowers['RAREHot'] = setoff.RAREHot;
        setoff.RAREPowers['RARESpeckle'] = setoff.RARESpeckle;
        setoff.RAREPowers['RAREClouds'] = setoff.RAREClouds;
        setoff.RAREPowers['RARELightColor'] = setoff.RARELightColor;

        const rarity_rate_abs =
        parseInt(setoff.RARECloudiness, 10) +
        parseInt(setoff.RARECold, 10) +
        parseInt(setoff.RAREOcean, 10) +
        parseInt(setoff.RARETemperate, 10) +
        parseInt(setoff.RAREWarm, 10) +
        parseInt(setoff.RAREHot, 10) +
        parseInt(setoff.RARESpeckle, 10) +
        parseInt(setoff.RAREClouds, 10) +
        parseInt(setoff.RARELightColor, 10); // +

        setoff.vRarityAbsolute = Math.ceil(rarity_rate_abs / 9);
        if ( setoff.vRarityAbsolute >= 100 ) {
          setoff.vRarityAbsolute = 100;
        }

        // setoff.card_power = setoff.vRarityAbsolute;

        const rarity_chance = 5;
        setoff.RARECloudiness = Math.floor( parseInt(setoff.RARECloudiness + rarity_chance /*chance %*/, 10) / 100 );
        setoff.RARECold = Math.floor( parseInt(setoff.RARECold + rarity_chance /*chance %*/, 10) / 100 );
        setoff.RAREOcean = Math.floor( parseInt(setoff.RAREOcean + rarity_chance /*chance %*/, 10) / 100 );
        setoff.RARETemperate = Math.floor( parseInt(setoff.RARETemperate + rarity_chance /*chance %*/, 10) / 100 );
        setoff.RAREWarm = Math.floor( parseInt(setoff.RAREWarm + rarity_chance /*chance %*/, 10) / 100 );
        setoff.RAREHot = Math.floor( parseInt(setoff.RAREHot + rarity_chance /*chance %*/, 10) / 100 );
        setoff.RARESpeckle = Math.floor( parseInt(setoff.RARESpeckle + rarity_chance /*chance %*/, 10) / 100 );
        setoff.RAREClouds = Math.floor( parseInt(setoff.RAREClouds + rarity_chance /*chance %*/, 10) / 100 );
        setoff.RARELightColor = Math.floor( parseInt(setoff.RARELightColor + rarity_chance /*chance %*/, 10) / 100 );

        // console.log( setoff.Owner.length );
        // return null;
        setoff.Owned = false;
        if ( setoff.Owner.length === 0 ) {
          return null;
        } else {
          if ( setoff.Owner === this.wallet_address ) {
            setoff.Owned = true;
          }
        }

        if ( setoff.Name.length === 0 ) {
          setoff.Name = 'Unknown';
        }

        if ( setoff.Moto.length === 0 ) {
          setoff.Moto  = 'Planet Mass: ' + setoff.Mass + ' ∇<br/>';
          setoff.Moto += 'Population: ≈' + setoff.Population + '<br/>';
          setoff.Moto += 'Temperature: ' + (+setoff.AvgTemp + Math.random() * 20).toFixed(2) + ' °<br/>';
        }

        const rarity_rate =
        setoff.RARECloudiness +
        setoff.RARECold +
        setoff.RAREOcean +
        setoff.RARETemperate +
        setoff.RAREWarm +
        setoff.RAREHot +
        setoff.RARESpeckle +
        setoff.RAREClouds +
        setoff.RARELightColor; // +
        // setoff.RAREHaze;

        // Calculated
        setoff.vRarityRate = 0;
        if ( rarity_rate >= 3 ) { setoff.vRarityRate = 1; }
        if ( rarity_rate >= 6 ) { setoff.vRarityRate = 2; }
        if ( rarity_rate >= 9 ) { setoff.vRarityRate = 3; }

        // setoff.next_redeem_at

        setoff.x = planet_pos.split(':')[0];
        setoff.y = planet_pos.split(':')[1];
        setoff.z = planet_pos.split(':')[2];

        // console.log(setoff);
        return JSON.parse(JSON.stringify(setoff));
      } catch (err) {
        // Sector is empty
        // console.log( err );
        return null;
      }
    } else {
      return null;
    }

  }

  public objectToString(o) {
    Object.keys(o).forEach(k => {
      if (typeof o[k] === 'object') {
        return o[k].toString();
      }
      o[k] = '' + o[k];
    });
    return o;
  }

  public async perform_call(data, httpOptions) {

    {

      const loading = await this.presentLoadingWithOptions('Interacting With Wallet Endpoint');
      this.http.post(this.wallet + '/json_rpc', data, httpOptions)
      .toPromise()
      .then(responseAfterSuccess => {
        loading.dismiss();

        // console.log(responseAfterSuccess);
        if ( responseAfterSuccess['error'] ) {
          this.toast( responseAfterSuccess['error']['message'], 'warning', null, null );
        } else {
          this.wallet_execution_response = responseAfterSuccess;
          this.latest_txs.push({request: JSON.parse(data), response: responseAfterSuccess});
          this.latest_tx_count++;
          // console.log(this.wallet_execution_response.result);
          this.toast(
            'Transaction sent to Blockchain. Once its mined press (Refresh Blockchain State) to see results.\n' +
            'You can also check transaction status in (Latest TX`s) section.\n' +
            this.wallet_execution_response.result.tx_hash_list[0], 'success', null, 6000);
        }
      })
      .catch(responseAfterError => {
        loading.dismiss();

        this.toast(
          'Cannot reach wallet endpoint.' +
          'Make sure youre running your wallet with --rpc-server and settings are correct.' +
          'You can manualy execute command using snippet below:', 'danger', null, null);
        this.wallet_status = 0;
        this.wallet_execution_response = null;
        // console.log('curl -X POST ' + (this.wallet) + '/json_rpc -H "Content-Type: application/json" -d ' + data);

        this.toast(
          'curl -X POST ' + (this.wallet) + '/json_rpc -H "Content-Type: application/json" -d ' + JSON.stringify((data)),
          'dark',
          'bottom',
          15000 );

      });

    }

  }

  public async execute_command(method, params, value) {
    this.wallet_execution_response = null;
    // console.log(this.active_method);
    // Preparing clean object to pass into wallet
    const copm_tx = {
      'mixin' : 0,
      'get_tx_key' : true,
      'sc_tx' :
      {
        'entrypoint': method,
        'scid': this.contract,
        'params': this.objectToString(params),
        'value': parseInt(value, 10)
      }
    };

    if ( typeof(params) === 'undefined' ) {
      delete copm_tx.sc_tx.params;
    }

    // console.log(value);
    if ( typeof(value) === 'undefined' ) {
      delete copm_tx.sc_tx.value;
    }

    // console.log(params);

    // Sending Raw to omit CORS
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    // const params = {};
    const data = JSON.stringify({ 'jsonrpc' : '2.0', 'id': 0, 'method': 'transfer_split', 'params': copm_tx});

    let line = '';
    Object.keys(copm_tx.sc_tx.params).forEach((key) => {
      line += '<b>' + key + '</b>: ' + copm_tx.sc_tx.params[key] + '<br/>';
    });

    const alert = await this.alertController.create({
      header: 'Confirm interaction',
      subHeader: 'Buy pressing okay, wallet will execute folowing command:',
      message: '<b>' + method + (value ? ' <span class="al">(' + this.onChain_value(value) + ' DERO)</span>' : '') + '</b><hr/>' + line,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'warning',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Confirm',
          handler: async () => {
            this.perform_call(data, httpOptions);
            // this.perform_call(data, httpOptions);
            // this.perform_call(data, httpOptions);
          }
        }
      ]
    });

    await alert.present();

  }

  public reloadTXs() {
    this.latest_tx_count = 0;
    // public latest_txs = [];

    const ray = [];
    const ray_errors = [];
    for (let i = 0; i < this.latest_txs.length; i++) {
      ray.push(this.latest_txs[i].response.result.tx_hash_list[0]);
      ray_errors.push(this.latest_txs[i].response.result.tx_hash_list[0] + '_error');
    }

    const params = {'txs_hashes': ray};

    const data = JSON.stringify(params);

    // console.log('init');
    this.http.post(this.daemon + '/gettransactions', data)
    .toPromise()
    .then(responseAfterSuccess => {
      const subj: any = <any>responseAfterSuccess;
      if ( subj.status === 'OK' && subj.txs ) {
        for (let j = 0; j < subj.txs.length; j++) {
          this.latest_txs[j].status = subj.txs[j];
        }
      }
    });

    const paramsc = {'txs_hashes': [this.contract], 'sc_keys': ray_errors};

    const datac = JSON.stringify(paramsc);

    if ( ray_errors.length ) {
      this.http.post(this.daemon + '/gettransactions', datac)
      .toPromise()
      .then(responseAfterSuccess => {
        const subj: any = <any>responseAfterSuccess;
        if ( subj.status === 'OK' && subj.txs && this.latest_txs && ray ) {
          for (let j = 0; j < ray_errors.length; j++) {
            this.latest_txs[j].error = subj.txs[0].sc_keys[ray_errors[j]];
          }
        }
      });
    }


    console.log( this.latest_txs );

  }

  public async view_contract() {
    const modal = await this.modalController.create({
      component: ModalExample,
      componentProps: { value: this.contract_response.txs[0].sc_raw }
    });
    return await modal.present();
  }

  public async load_game_settings() {

    const res = await this.fetch_contract([
      'admin',
      'stats_excelent_cards',
      'stats_planet_counter',

      'variable_colonize_fee',
      'variable_sector_moto_fee',
      'variable_dev_fee',
      'variable_redeem_offset',
      'variable_redeem_precent',
      'variable_enchant_precent',

      'balance_dev_fee',
      'balance_shared_pool',

      this.wallet_address + '_credit'
    ]);
    if ( res != null ) {
      // Blockchain got an actual data
      // Parse keys per planet
      try {
        const contract_keys: any = res.txs[0].sc_keys;
        this.settings_laoded = contract_keys;
      } catch (err) {
        // console.log('SETTINGS', contract_keys);
      }
    }

  }

  public async fetch_contract(sc_keys, ignore_loading = false, ignore_error = false) {
    console.log('Ping: Contract');
    this.active_method = null;
    const params = {'txs_hashes': [this.contract], 'sc_keys': []};
    if ( sc_keys ) {
      params.sc_keys = sc_keys;
    }
    const data = JSON.stringify(params);

    let loading = null;
    if ( ignore_loading === true ) {
      loading = await this.presentLoadingWithOptions('Loading Blockchain State');
    }

    // console.log('init');
    await this.http.post(this.daemon + '/gettransactions', data)
    .toPromise()
    .then(responseAfterSuccess => {
      // console.log('async');
      const subject = responseAfterSuccess;
      if (subject['status'] === 'OK') {
        this.contract_response = subject;
      } else {
        if ( ignore_error === false ) {
          this.toast(subject['status'], 'warning', null, null);
        }
        this.contract_response = null;
      }
    })
    .catch(responseAfterError => {
      if ( ignore_error === false ) {
        this.toast('Cannot reach Daemon endpoint, please verify settings', 'danger', null, null);
      }
      this.contract_response = null;
    });

    if ( ignore_loading === true && loading != null ) {
      loading.dismiss();
    }
    // console.log('await');
    return this.contract_response;
  }

  public async toast(message, color, pos, duration) {
    const toast = await this.toastController.create({
      message: message,
      showCloseButton: true,
      position: pos || 'middle',
      color: color,
      cssClass: 'toast' + color,
      duration: duration || 6000,
      closeButtonText: 'OK'
    });
    toast.present();
  }

  public async deauth() {
    this.wallet_address = null;
  }

  public async auth() {
    this.wallet_execution_response = null;
    await this.execute_command('Authorize', {
    }, 0);
    // console.log( this.wallet_execution_response );
  }

  public async auth_verify() {
    let tx = '';
    if ( this.wallet_execution_response ) {
      // tx = this.wallet_execution_response.
      // console.log(this.wallet_execution_response);
      tx = this.wallet_execution_response.result.tx_hash_list[0];
      this.confirm_auth(tx);
    } else {
      const alert = await this.alertController.create({
        header: 'Provide tx hash of auth method interaction',
        inputs: [
          {
            name: 'tx',
            type: 'text',
            placeholder: 'Enter transaction hash...'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'warning',
            handler: () => {
              console.log('Confirm Cancel');
            }
          }, {
            text: 'Proceed',
            handler: (ev) => {
              if ( ev.tx.length > 0 ) {
                this.confirm_auth(ev.tx);
              }
            }
          }
        ]
      });

      await alert.present();
    }

  }

  public async confirm_auth(tx) {
    const res = await this.fetch_contract([
      'auth_' + tx
    ]);
    if ( res != null ) {
      // Blockchain got an actual data
      // Parse keys per planet
      try {
        const contract_keys = res.txs[0].sc_keys;
        if ( contract_keys['auth_' + tx] !== '' ) {
          this.wallet_address = contract_keys['auth_' + tx];
        } else {
          const alert = await this.alertController.create({
            header: 'Auth',
            subHeader: 'Authorization attempt failed',
            message: 'Invalid TX <b>(' + tx + ')</b> or transaction is not yet mined, try again later if you sure tx is correct',
            buttons: ['OK']
          });

          await alert.present();
        }
      } catch (err) {
        // err
      }
    }
  }

  public async ping_wallet() {

    this.wallet_status = 1;
    console.log('Ping: Wallet');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    const params = {};
    const data = JSON.stringify({ 'jsonrpc' : '2.0', 'id': 0, 'method': 'getbalance', 'params': params});

    // const loading = await this.presentLoadingWithOptions('Loading Wallet State');

    this.http.post(this.wallet + '/json_rpc', data, httpOptions).subscribe(
      responseAfterSuccess => {
        const subject = responseAfterSuccess;
        if (subject['id'] === 0 && !subject['error']) {
          this.wallet_response = subject;
          this.wallet_status = 3;
          // this.wallet_address = subject.result.address;
          //
        } else {
          this.toast('Cannot reach wallet endpoint. Make sure it is accessible.', 'danger', null, null);
          // alert('Error: Something went wrong');
          this.wallet_response = null;
          this.wallet_status = 0;
        }
        // loading.dismiss();
      },
      responseAfterError => {
        /*
        prep_data = "{\"jsonrpc\":\"2.0\",\"id\":\"0\",\"method\":\"transfer_split\",\"params\":"+(JSON.stringify(copm_tx))+"}";
        prep_data = JSON.stringify(prep_data);
        $('.pre1').text("curl -X POST "+($('.wallet_rpc').val())+"json_rpc -H \"Content-Type: application/json\" -d "+prep_data);
        */
        this.toast(
          'Cannot reach wallet endpoint. Make sure wallet is running with --rpc-server or continue using dApp in offline mode.',
          'danger', null, null);
        // web Version
        // electron Version
        this.wallet_status = 0;
        this.wallet_response = null;
        // loading.dismiss();
      }
    );
  }

  public async ping_daemon() {
    this.daemon_status = 1;
    console.log('Ping: Daemon');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    const params = {};
    const data = JSON.stringify({ 'jsonrpc' : '2.0', 'id': 0, 'method': 'get_info', 'params': params});
    const loading = await this.presentLoadingWithOptions('Loading Daemon State');

    this.http.post(this.daemon + '/json_rpc', data, httpOptions).subscribe(
      responseAfterSuccess => {
        this.daemon_response = responseAfterSuccess;
        this.daemon_status = 3;
        this.load_game_settings();
        this.run_block_timer();
        loading.dismiss();
      },
      responseAfterError => {
        this.toast(
          'Cannot reach daemon endpoint. Make sure daemon is running localy and path is correct or use remote daemon address.',
          'danger', null, null);
        this.daemon_status = 0;
        this.daemon_response = null;
        loading.dismiss();
      }
    );
  }

  public refreshAll() {
    this.ping_daemon();
    this.ping_wallet();
  }

  private register_sound(key, sound) {
    this.soundList[key] = new Audio();
    this.soundList[key].src = '../../../assets/sound/' + sound;
    this.soundList[key].load();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.storage.ready().then(() => {

        this.storage.get('wallet').then((val) => {
          if (val) {
            console.log('Your wallet is', val);
            this.wallet = val;
          } else {
            this.wallet = 'http://127.0.0.1:30309';
            this.storage.set('wallet', this.wallet);
          }
          this.ping_wallet();
        });

        this.storage.get('daemon').then((val) => {
          if (val) {
            console.log('Your daemon is', val);
            this.daemon = val;
          } else {
            this.daemon = 'http://127.0.0.1:30306';
            this.storage.set('daemon', this.daemon);
          }
          this.ping_daemon();
        });

        this.storage.get('wallet_address').then((val) => {
          if (val) {
            console.log('Your wallet_address is', val);
            this.wallet_address = val;
          }
        });

        // this.register_sound('beep', 'click.wav');
        // this.register_sound('deepbeep', '131658__bertrof__game-sound-selection.wav');

        // this.soundList['beep'].play();

      });
    });
  }
}
