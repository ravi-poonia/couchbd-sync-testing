const database = require('./database');
const { getStore } = require('./utils/Store');

async function syncTable(table, params) {
  const db = await database.getDatabase();
  const subscription = db[table].sync(params);

  if (db) {
    return new Promise((resolve, reject) => {
      subscription.error$.subscribe(err => {
        console.log('----->error ', err);
        reject(err);
      });
      subscription.change$.subscribe(change => {
        console.log('----->  change ', table, change);
        console.log('----->  change owner docs ', change.change.docs);
      });
      subscription.complete$.subscribe(complete => {
        const data = !complete
          ? complete
          : { push: complete.push.docs_read, pull: complete.pull.docs_written };
        console.log('----->  complete ', table, data);
        resolve(complete);
      });
    });
  }
}

async function syncDatabase() {
  const DB_URL = 'http://admin:admin@localhost:5984/testing';

  const params = {
    remote: DB_URL, // remote database. This can be the serverURL, another RxCollection or a PouchDB-instance
    waitForLeadership: true, // (optional) [default=true] to save performance, the sync starts on leader-instance only
    direction: {
      // direction (optional) to specify sync-directions
      pull: true, // default=true
      push: true, // default=true
    },
    options: {
      // sync-options (optional) from https://pouchdb.com/api.html#replication
      retry: true,
    },
  };

  ['owner', 'party', 'employee', 'account'].map(async table => {
    try {
      await syncTable(table, params);
    } catch (err) {
      console.log('-----> syncTable ', table, err);
    }
  });

  return true;
}

async function enableDBSyncing() {
  syncDatabase();
}

async function createCollections(db, dbModels) {
  try {
    console.log(':: creating collections');
    return Promise.all(
      dbModels.map(async ({ model, hooks = {} }) => {
        const collection = await db.collection(model);

        Object.keys(hooks).map(hook => {
          collection[hook](hooks[hook]);
        });
      }),
    );
  } catch (err) {
    console.log('-----> createCollections err', err);
  }
}

async function clearRemoteDB() {
  try {
    console.log(':: creating remote DB');

    const store = getStore();

    const { settings } = store.get('appData');
    const { enableSync = false, serverUrl = '' } = settings;
    if (enableSync) {
      const nano = require('nano')(serverUrl);

      let result = await nano.db.destroy('transport');

      console.log('----->result ', result);

      return result;
    }
  } catch (err) {
    console.log('-----> clearRemoteDB err', err);
  }
}

module.exports = { createCollections, enableDBSyncing, clearRemoteDB };
