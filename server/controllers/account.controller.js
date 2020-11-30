const database = require('./../database');
var qs = require('qs');
const _ = require('lodash');
const { saveImages } = require('./../utils');

/**
 * description
 * Add default cash account in the accounts collection
 * @param {*} db
 * @returns Cash Account
 */
const createDefaultCashAccount = async db => {
  try {
    let existingAccount = await db.account
      .findOne({
        selector: { type: 'CASH' },
      })
      .exec();
    if (existingAccount) return;

    const account = await db.account.insert({
      displayName: 'CASH',
      accountName: 'CASH',
      type: 'CASH',
      opening: 0,
      closing: 0,
    });
    return account;
  } catch (error) {
    console.log('-----> error', error);
  }
};

async function getAccounts(req, res) {
  try {
    const db = await database.getDatabase();

    let parsedQuery = qs.parse(req.payload.query);

    const { limit = 50, skip = 0, sortBy = 'createdAt', sortOrder = -1 } = parsedQuery;

    const query = _.omit(parsedQuery, ['limit', 'skip', 'sortBy', 'sortOrder']);

    const accounts = await db.account.list(
      query,
      {
        limit,
        skip,
      },
      {
        sortBy,
        sortOrder,
      },
    );

    return Promise.resolve(
      res.send({
        ok: true,
        status: 200,
        message: 'Successfully fetched all accounts!',
        data: accounts,
      }),
    );
  } catch (err) {
    return Promise.resolve(
      res.error({
        ok: false,
        status: 400,
        message: err.message,
      }),
    );
  }
}

async function createAccount(req, res) {
  try {
    const db = await database.getDatabase();

    let { data } = req.payload;
    const { images, body } = data;
    const { displayName } = body;

    let existingAccount = await db.account
      .findOne({
        selector: { displayName: displayName.trim() },
      })
      .exec();

    if (existingAccount) {
      return Promise.resolve(
        res.error({
          ok: false,
          status: 401,
          message: 'Account is already Added.',
        }),
      );
    }

    let account = await db.account.newDocument(body);

    account = await saveImages({
      data: account,
      name: account.displayName,
      images,
      path: 'accountDocs',
    });

    account.closing = body.opening || 0;

    await account.save();

    return Promise.resolve(
      res.send({
        ok: true,
        status: 200,
        message: 'Successfully created account!',
        data: account.toJSON(),
      }),
    );
  } catch (err) {
    return Promise.resolve(
      res.error({
        ok: false,
        status: 400,
        message: err.message,
      }),
    );
  }
}

async function updateAccount(req, res) {
  try {
    const db = await database.getDatabase();

    let { id, data } = req.payload;
    let { images, body } = data;
    const { opening, displayName } = body;

    const account = await db.account
      .findOne({
        selector: { _id: id },
      })
      .exec();

    let { closing = 0, opening: oldOpening = 0 } = account;
    let newClosing = closing + opening - oldOpening;

    body = await saveImages({
      data: body,
      name: displayName,
      images,
      path: 'accountDocs',
    });

    await account.update({ $set: { ...body, closing: newClosing } });

    return Promise.resolve(
      res.send({
        ok: true,
        status: 200,
        message: 'Successfully updated account!',
        data: account.toJSON(),
      }),
    );
  } catch (err) {
    return Promise.resolve(
      res.error({
        ok: false,
        status: 400,
        message: err.message,
      }),
    );
  }
}

async function deleteAccount(req, res) {
  try {
    const db = await database.getDatabase();

    let { id } = req.payload;

    const account = await db.account
      .findOne({
        selector: { _id: id },
      })
      .exec();

    await account.remove();

    return Promise.resolve(
      res.send({
        ok: true,
        status: 200,
        message: 'Successfully deleted account!',
        data: account.toJSON(),
      }),
    );
  } catch (err) {
    return Promise.resolve(
      res.error({
        ok: false,
        status: 400,
        message: err.message,
      }),
    );
  }
}

module.exports = {
  getAccounts,
  createDefaultCashAccount,
  createAccount,
  updateAccount,
  deleteAccount,
};
