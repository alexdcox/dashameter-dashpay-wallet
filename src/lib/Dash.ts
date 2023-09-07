import {Account, Client} from "dash";
import {Identity, ExtendedDocument} from '@dashevo/wasm-dpp'
import * as localforage from "localforage";

export default class Dash {
  private static _client: InstanceType<typeof Client> | undefined;
  private static _account: InstanceType<typeof Account> | undefined;
  private static _identity: Identity | undefined;
  private static _dpnsDoc: ExtendedDocument | undefined;

  private static loadDeferred: Promise<InstanceType<typeof Client>> | undefined;
  private static apps = new Map<string, string>() // name -> contractId

  public static async client(): Promise<InstanceType<typeof Client>> {
    return this.loadDeferred || this.loadNewWallet()
  }

  public static async account(): Promise<InstanceType<typeof Account>> {
    return this.client().then(() => this._account)
  }

  public static async identity(): Promise<InstanceType<typeof Identity> | undefined> {
    return this.client().then(() => this._identity)
  }

  public static async dpnsDoc(): Promise<InstanceType<typeof ExtendedDocument> | undefined> {
    return this.client().then(() => this._dpnsDoc)
  }

  public static async loadNewWallet(): Promise<InstanceType<typeof Client>> {
    console.log("[Dash] Loading NEW wallet")
    return this.init(undefined)
  }

  public static async loadWalletFromMnemonic(mnemonic: string): Promise<InstanceType<typeof Client>> {
    console.log("[Dash] Loading EXISTING wallet with mnemonic")
    if (mnemonic.split(' ').length != 12) {
      return Promise.reject('Invalid mnemonic, expected 12 words')
    }
    return this.init(mnemonic)
  }

  public static async registerIdentity(): Promise<InstanceType<typeof Identity>> {
    console.log('[Dash] Registering new identity')
    if (this._client === undefined) {
      throw 'Cannot create a new platform identity, no wallet has been loaded'
    }
    const registerResponse = await this._client.platform.identities.register()
    const identity = await this._client.platform.identities.get(registerResponse.id)
    console.log('[Dash] New identity created', identity)
    this._identity = identity
    return identity
  }

  public static async disconnect() {
    this._client?.disconnect();
    this.loadDeferred = undefined;
    this._client = undefined;
    this._account = undefined;
    this._identity = undefined;
    this._dpnsDoc = undefined;
  }

  private static async init(mnemonic: string | undefined): Promise<InstanceType<typeof Client>> {
    this.loadDeferred = this.disconnect().then(() => new Promise((resolve, reject) => (async () => {
      console.log("[Dash] init wallet")

      const options: any = {
        wallet: {
          adapter: localforage,
        }
      }

      if (typeof mnemonic === 'string') {
        options.wallet = {
          ...options.wallet,
          mnemonic,
          unsafeOptions: {
            skipSynchronizationBeforeHeight: 874000, // TODO: remove this!
          },
        }
      }

      try {
        console.log("[Dash] Initialising Dash Client", options)
        this._client = new Client(options);

        if (options.wallet?.unsafeOptions?.skipSynchronizationBeforeHeight > 0) {
          console.warn(`Skipping ${options.wallet.unsafeOptions.skipSynchronizationBeforeHeight} blocks`)
        }

        const apps = this._client.getApps()
        console.log(`[Dash] Found ${apps.getNames().length} existing apps:`)
        apps.getNames().forEach((name: string) => {
          const app = apps.get(name)
          console.log(`[Dash] - ${name} ${app.contractId}`)
          this.apps.set(name, app.contractId.toString())
        })

        if (!this._account) {
          console.log('[Dash] Blockchain history loading...')
          console.time('[Dash] Blockchain history loaded');
          this._account = await this._client.getWalletAccount();
          console.timeLog('[Dash] Blockchain history loaded')
          console.log('[Dash] Wallet balance:', this._account.getTotalBalance() / 1e8);

          console.log('RECOVER DPNS?', this._client.getDAPIClient()?.DAPIClient?.accountDPNS)

          const identities = this._account.identities.getIdentityIds()
          if (identities.length) {
            console.log(`[Dash] Client has ${identities.length} existing identities`)
            identities.forEach(id => {
              console.log(`[Dash] - ${id}`)
            })
            this._identity = await this._client.platform.identities.get(identities[0])
            if (this._identity) {
              const identityId = this._identity.getId()
              console.log('[Dash] Get dpns name for identity:', identityId.toString())
              const dpnsDocs = await this._client.platform.names.resolveByRecord('dashUniqueIdentityId', identityId);
              console.log('[Dash] Found', dpnsDocs.length, 'names registered to identity')
              dpnsDocs.forEach((doc: any) => {
                console.log(`[Dash] - ${doc.toJSON().label}`, doc.toJSON())
              })
              this._dpnsDoc = dpnsDocs[0]
              console.log('[Dash] Assuming name', dpnsDocs?.[0]?.toJSON()?.label)
            }
          } else {
            console.log('[Dash] No identities registered for wallet account')
          }
        }

        resolve(this._client)
      } catch (e) {
        console.error(e)
        reject(e)
      }
    })()))

    return this.loadDeferred
  }
}