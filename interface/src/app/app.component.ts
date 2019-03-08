import { Component, ChangeDetectorRef  } from '@angular/core';

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
const bigInt = require('big-integer');

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

  public settings_laoded = {
    variable_colonize_fee:    '1000000000000',
    variable_sector_moto_fee: '500000000000', // Default value, may vary
    variable_nickname_fee:    '25000000000',
  };

  public contract = '74d410b02b7253ce61a6b57d369f22ba495a87786cc7bdd1131f2bfcd4f2fb40';
  public contract_response = null;
  public variables = [''];
  public active_method = null;
  public command = {};
  public soundList = {};

  public nicks_list = {};

  public chat_message = '';

  public loadingState = null;

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

  async presentLoadingWithOptions(text) {
    this.loadingState = await this.loadingController.create({
      spinner: 'crescent',
      duration: 2000,
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
    const position = bigInt( '500000000000000' ) .add( parseInt(pos, 10) );
    return position;
  }

  public onChain_value(full_dero) {
    return full_dero / 1000000000000;
  }

  public display_nickname(address) {
    if ( address == null || typeof( address ) === 'undefined' ) {
      return '';
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
        this.nicks_list[address] = responseAfterSuccess.txs[0].sc_keys[address + '_nick'];
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

    keys.push(planet_pos + '/index_in_stack');
    keys.push(planet_pos + '/txid');
    keys.push(planet_pos + '/planet_position');

    const setoff = {};

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

        setoff.RARECloudiness = (+setoff.RARECloudiness >= 100 ) ? 100 : +setoff.RARECloudiness;
        setoff.RARECold = (+setoff.RARECold >= 100 ) ? 100 : +setoff.RARECold;
        setoff.RAREOcean = (+setoff.RAREOcean >= 100 ) ? 100 : +setoff.RAREOcean;
        setoff.RARETemperate = (+setoff.RARETemperate >= 100 ) ? 100 : +setoff.RARETemperate;
        setoff.RAREWarm = (+setoff.RAREWarm >= 100 ) ? 100 : +setoff.RAREWarm;
        setoff.RAREHot = (+setoff.RAREHot >= 100 ) ? 100 : +setoff.RAREHot;
        setoff.RARESpeckle = (+setoff.RARESpeckle >= 100 ) ? 100 : +setoff.RARESpeckle;
        setoff.RAREClouds = (+setoff.RAREClouds >= 100 ) ? 100 : +setoff.RAREClouds;
        setoff.RARELightColor = (+setoff.RARELightColor >= 100 ) ? 100 : +setoff.RARELightColor;

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

        setoff.vRarityAbsolute = Math.round(rarity_rate_abs / 9 / 4);
        if ( setoff.vRarityAbsolute >= 100 ) {
          setoff.vRarityAbsolute = 100;
        }

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
        'params': params,
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
      message: '<b>' + method + (value ? ' (' + this.onChain_value(value) + ' DERO)' : '') + '</b><hr/>' + line,
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
          handler: () => {
            // console.log('Confirm Ok');

            this.http.post(this.wallet + '/json_rpc', data, httpOptions)
            .toPromise()
            .then(responseAfterSuccess => {
              console.log(responseAfterSuccess);
              if ( responseAfterSuccess['error'] ) {
                this.toast( responseAfterSuccess['error']['message'], 'warning' );
              } else {
                this.wallet_execution_response = responseAfterSuccess;
                this.toast(
                  'Transaction sent to Blockchain. Once its mined press (Refresh Blockchain State) to see results.', 'succsess');
              }
            })
            .catch(responseAfterError => {
              this.toast(
                'Cannot reach wallet endpoint.' +
                'Make sure youre running your wallet with --rpc-server and settings are correct.' +
                'You can manualy execute command using snippet below:', 'danger');
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
      ]
    });

    await alert.present();

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
      'variable_nickname_fee',
      'variable_emperor_discount_per_topo',
      'variable_dev_fee',

      'galaxy_center',

      'emperor_bid',
      'emperor_last_check_topo',
      'emperor_user',

      'balance_dev_fee',
      'balance_shared_pool'
    ]);
    if ( res != null ) {
      // Blockchain got an actual data
      // Parse keys per planet
      try {
        const contract_keys = res.txs[0].sc_keys;
        this.settings_laoded = contract_keys;
      } catch (err) {
        console.log('SETTINGS', contract_keys);
      }
    }

  }

  public async fetch_contract(sc_keys, ignore_loading, ignore_error = false) {
    console.log('Ping: Contract');
    this.active_method = null;
    const params = {'txs_hashes': [this.contract], 'sc_keys': []};
    if ( sc_keys ) {
      params.sc_keys = sc_keys;
    }
    const data = JSON.stringify(params);

    if ( ignore_loading === true ) {
      const loading = await this.presentLoadingWithOptions('Loading Blockchain State');
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
        this.toast(subject['status'], 'warning');
        this.contract_response = null;
      }
    })
    .catch(responseAfterError => {
      if ( ignore_error === false ) {
        this.toast('Cannot reach Daemon endpoint, please verify settings', 'danger');
      }
      this.contract_response = null;
    });

    if ( ignore_loading === true ) {
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

  public async ping_wallet() {
    this.wallet_status = 1;
    console.log('Ping: Wallet');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    const params = {};
    const data = JSON.stringify({ 'jsonrpc' : '2.0', 'id': 0, 'method': 'getaddress', 'params': params});


    // const loading = await this.presentLoadingWithOptions('Loading Wallet State');

    this.http.post(this.wallet + '/json_rpc', data, httpOptions).subscribe(
      responseAfterSuccess => {
        const subject = responseAfterSuccess;
        if (subject['id'] === 0 && !subject['error']) {
          this.wallet_response = subject;
          this.wallet_status = 3;
          this.wallet_address = 'set';
          //
        } else {
          this.toast('Cannot reach wallet endpoint. Make sure it is accessible.', 'danger');
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
          'Cannot reach wallet endpoint. Make sure wallet is running with --rpc-server or continue using dApp in offline mode.', 'danger');
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

        loading.dismiss();
      },
      responseAfterError => {
        this.toast(
          'Cannot reach daemon endpoint. Make sure daemon is running localy and path is correct or use remote daemon address.', 'danger');
        this.daemon_status = 0;
        this.daemon_response = null;
        loading.dismiss();
      }
    );
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
            this.wallet = 'http://127.0.0.1:30307';
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
