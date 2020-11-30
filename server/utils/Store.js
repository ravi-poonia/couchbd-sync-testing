const Store = require('electron-store');

// First instantiate the app store
const store = new Store({
  name: 'allStore.json',
  defaults: {
    windowBounds: { width: 1024, height: 768 },
    appData: {
      settings: {},
    },
  },
});

function getStore() {
  return store;
}

module.exports = { getStore };
