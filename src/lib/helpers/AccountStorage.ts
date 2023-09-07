import {Preferences} from "@capacitor/preferences";
import crypto from "crypto";

export class LocalAccount {
  public name: string | undefined;
  public isNameRegistered = false;
  public encMnemonic: string | undefined;
  public identityId: string | undefined;

  constructor(o: any) {
    this.name = o.name
    this.isNameRegistered = o.isNameRegistered
    this.encMnemonic = o.encMnemonic
    this.identityId = o.identityId
  }

  id(): string {
    if (this.encMnemonic === undefined) {
      throw 'Cannot return id for local account without mnemonic'
    }
    return crypto.createHash("sha256").update(this.encMnemonic).digest("base64")
  }
}

export default class AccountStorage {
  public static async store(account: LocalAccount): Promise<boolean> {
    console.log('[AccountStorage] Store account', account)
    if (!(account instanceof LocalAccount)) {
      account = new LocalAccount(account)
    }
    const existingAccounts = await this.load()
    console.log("[AccountStorage] storedAccounts: ", existingAccounts);
    const accounts = {...existingAccounts, [account.id()]: account}
    await Preferences.set({key: "accounts", value: JSON.stringify(accounts)});
    return true
  }

  public static async list(): Promise<LocalAccount[]> {
    const existingAccounts = await this.load()
    return Array.from(existingAccounts.values())
  }

  private static async load(): Promise<Map<string, LocalAccount>> {
    const accounts = new Map<string, LocalAccount>()
    try {
      const storedAccountsJson: any = (await Preferences.get({key: "accounts"}))?.value;
      if (storedAccountsJson) {
        const storedAccounts = JSON.parse(storedAccountsJson)
        Object.entries(storedAccounts).forEach(([id, accountI]) => {
          const account: any = accountI
          accounts.set(id, new LocalAccount(account))
        })
      }
    } catch(e) {
      // do nothing
    }
    return accounts
  }
}