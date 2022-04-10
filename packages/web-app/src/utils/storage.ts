import Dexie from 'dexie';
import {SettingFlag, SettingString} from './types';

import {throwIfNotBrowser} from './index';

const DB_NAME_SETTINGS = 'Settings';

export class SettingsStore extends Dexie {
  private settings: Dexie.Table<SettingString, string>; // string = type of the primkey
  private flags: Dexie.Table<SettingFlag, string>;

  constructor() {
    super(DB_NAME_SETTINGS);
    throwIfNotBrowser();

    // NOTE: ALWAYS KEEP the existing schema definitions
    this.version(1).stores({
      settings: '&key',
      flags: '&key',
    });

    // Add newer schema changes above

    // This is needed if your typescript is compiled using babel instead of tsc:
    this.settings = this.table('settings');
    this.flags = this.table('flags');
  }

  // STRINGS

  /** Writes the following setting (string) to IndexedDB. If it already exist, it overwrites its value. */
  set(key: string, value: string): Promise<number> {
    return this.settings.update(key, {value}).catch(err => {
      console.error('Incognito mode might be on', err);
      throw err;
    });
  }

  /** Fetches the value for the given key. */
  get(key: string): Promise<string> {
    return this.settings
      .get(key)
      .then(entry => entry?.value || '')
      .catch(err => {
        console.error('Incognito mode might be on', err);
        throw err;
      });
  }

  /** Fetches all the settings stored as a string. */
  all(): Promise<SettingString[]> {
    return this.settings.toArray().catch(err => {
      console.error('Incognito mode might be on', err);
      throw err;
    });
  }

  // FLAGS

  /** Writes the following flag to IndexedDB. If it already exist, it overwrites its value. */
  setFlag(key: string, value: boolean): Promise<number> {
    return this.flags.update(key, {value}).catch(err => {
      console.error('Incognito mode might be on', err);
      throw err;
    });
  }

  /** Fetches the flag value for the given key. */
  getFlag(key: string): Promise<boolean> {
    return this.flags
      .get(key)
      .then(entry => entry?.value || false)
      .catch(err => {
        console.error('Incognito mode might be on', err);
        throw err;
      });
  }

  /** Fetches all the UI flags. */
  allFlags(): Promise<SettingFlag[]> {
    return this.flags.toArray().catch(err => {
      console.error('Incognito mode might be on', err);
      throw err;
    });
  }
}

/*
EXAMPLE
-------------------------------------------------------------------------------

const mySettings = new SettingsStore()

await mySettings.set("name", "John")
await mySettings.set("lastName", "Smith")
await mySettings.get("name") // "John"
await mySettings.get("lastName") // "Smith"
await mySettings.get("does-not-exist") // ""
await mySettings.all() // [{key: "name", value: "John"}, {key: "lastName", value: "Smith"}]

await mySettings.setFlag("essential-cookies", true)
await mySettings.setFlag("optional-cookies", false)
await mySettings.getFlag("essential-cookies") // true
await mySettings.getFlag("optional-cookies") // false
await mySettings.getFlag("does-not-exist-either") // false
await mySettings.allFlags() // [{key: "essential-cookies", value: true}, {key: "optional-cookies", value: false}]

*/
