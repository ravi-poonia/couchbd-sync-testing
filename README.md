# Couch DB sync issue reproduction example

### Run the app
```
npm run dev:electron
```

In the example, I have added 4 schema : owner, party, employee, account.
I add a document in account on DB creation.

If I make any changes in the codebase, The electron restarts and the same document is pulled in the rest of the three collections.

Logs:
First execution: **I have removed the 2 index doc logs for clarity**
```
:: window ready
:: creating collections

----->  change  account {
  direction: 'push',
  change: {
    ok: true,
    start_time: '2020-11-30T23:52:22.461Z',
    docs_read: 3,
    docs_written: 3,
    doc_write_failures: 0,
    errors: [],
    last_seq: 3,
    docs: [ [Object], [Object], [Object] ]
  }
}
----->  change account docs  [
  {
    displayName: 'CASH',
    accountName: 'CASH',
    type: 'CASH',
    opening: 0,
    closing: 0,
    schema: 'accountSchema',
    createdAt: '2020-11-30T23:52:17.444Z',
    updatedAt: '2020-11-30T23:52:17.444Z',
    _id: '647973fb-2025-4a2e-aa6c-3177cda8bc38',
    _rev: '1-5ea5d3ec58ad3368483177aa4c1aa469'
  }
]

**Here the 2 push for all collections are for indexes**
----->  complete  owner { push: 2, pull: 0 }
----->  complete  party { push: 2, pull: 0 }
----->  complete  account { push: 3, pull: 0 }
----->  complete  employee { push: 2, pull: 0 }
```

second execution
```
----->  complete  account { push: 0, pull: 0 }
----->  complete  employee { push: 0, pull: 1 }
----->  complete  owner { push: 0, pull: 1 }
----->  complete  party { push: 0, pull: 1 }
```

As you can see, In the second execution, the document I pushed in the first one is being pulled by the rest of collections.


