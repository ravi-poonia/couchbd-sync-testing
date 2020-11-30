const path = require('path');
const electron = require('electron');
const dbModels = require('./models');
const leveldown = require('leveldown');
const RxDBLevelDBAdapter = require('pouchdb-adapter-leveldb');
const RxDBHTTPAdapter = require('pouchdb-adapter-http');
const { createRxDatabase, addRxPlugin } = require('rxdb');
const { createDefaultCashAccount } = require('./controllers/account.controller');
const { RxDBDevModePlugin } = require('rxdb/plugins/dev-mode');
const { RxDBMigrationPlugin } = require('rxdb/plugins/migration');
const { RxDBJsonDumpPlugin } = require('rxdb/plugins/json-dump');
const { RxDBUpdatePlugin } = require('rxdb/plugins/update');
const { createCollections, clearRemoteDB, enableDBSyncing } = require('./database.helper');

//Add pluggins
addRxPlugin(RxDBMigrationPlugin);
addRxPlugin(RxDBJsonDumpPlugin);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBLevelDBAdapter);
addRxPlugin(RxDBHTTPAdapter);

if (process.env.NODE_ENV == 'development') {
  addRxPlugin(RxDBDevModePlugin);
}

// Registering all plugins provided by rxdb-utils
// register(addRxPlugin);

let _getDatabase; // cached

async function createDatabase(name, adapter = leveldown) {
  try {
    if (!name) {
      return new Error('DB name is missing');
    }

    const db = await createRxDatabase({
      name,
      adapter,
      password: 'myLongAndStupidPassword',
      multiInstance: false,
    });

    const CLEAR_DATABASE = false;

    if (CLEAR_DATABASE) {
      await db.remove();
      await clearRemoteDB();
      console.log(':: Removed Database');
      return;
    }

    if (db) {
      //Initialize all controllers
      await createCollections(db, dbModels);

      await createDefaultCashAccount(db);

      setTimeout(() => {
        enableDBSyncing();
      }, 5000);
    }

    return db;
  } catch (error) {
    console.log('-----> error', error);
  }
}

async function getDatabase(name, adapter) {
  if (!_getDatabase) {
    _getDatabase = await createDatabase(name, adapter);
  }
  return _getDatabase;
}

async function closeDatabase() {
  if (_getDatabase) {
    await _getDatabase.destroy();
    _getDatabase = null;
  }
}

const imagesPath = path.join(electron.app.getAppPath(), '/images');
const dbPath = path.join(electron.app.getAppPath(), '/database');

exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
exports.imagesPath = imagesPath;
exports.dbPath = dbPath;
