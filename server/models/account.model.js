const { v4: uuidv4 } = require('uuid');

const accountSchema = {
  title: 'account schema',
  keyCompression: false,
  version: 0,
  description: 'describes a simple account',
  type: 'object',
  required: [],
  indexes: ['createdAt', '_id'],
  // attachments: {
  //   encrypted: false
  // },
  properties: {
    schema: {
      type: 'string',
      default: 'accountSchema',
    },
    _id: {
      type: 'string',
      primary: true,
    },
    displayName: {
      type: 'string',
    },
    accountNo: {
      //Bank account No
      type: 'string',
    },
    accountName: {
      //Name of the owner in Account record
      type: 'string',
    },
    bankName: {
      // bank account name
      type: 'string',
    },
    accountIn: {
      // bpcl , ril account in
      type: 'string',
    },
    owner: {
      type: 'string',
      ref: 'owner',
    },
    ifscCode: {
      type: 'string',
    },
    remark: {
      type: 'string',
    },
    opening: {
      type: 'number',
      default: 0,
    },
    closing: {
      type: 'number',
      default: 0,
    },
    type: {
      // bank , Fuel
      type: 'string',
    },
    createdAt: {
      format: 'date-time',
      type: 'string',
    },
    updatedAt: {
      format: 'date-time',
      type: 'string',
    },
  },
};

const model = {
  name: 'account',
  schema: accountSchema,
  autoMigrate: true, // <- migration will run at creation
  migrationStrategies: {
    // 1 means, this transforms data from version 0 to version 1
    // 1: function (oldDoc) {
    //   return oldDoc;
    // },
  },
  pouchSettings: {}, // (optional)

  statics: {
    // (optional) // ORM-functions for this collection
    /**
     * Get account
     * @param {ObjectId} id - The objectId of account.
     * @returns {Promise<Account, APIError>}
     */
    getOne(id) {
      return this.findOne({ selector: { _id: id } })
        .exec()
        .then(async doc => {
          if (doc) {
            const owner = await doc.owner_;
            let object = await doc.toJSON();

            object.owner = owner ? owner.toJSON() : undefined;

            return object;
          }
          const err = new Error('No such Account exists!');
          return Promise.reject(err);
        });
    },

    /**
     * List accounts in descending order of 'createdAt' timestamp.
     * @param {number} skip - "number" of accounts to be skipped.
     * @param {number} limit - Limit number of accounts to be returned.
     * @returns {Promise<Account[]>}
     */
    list(query = {}, pagination, sorting) {
      const { limit, skip } = pagination;
      const { sortBy, sortOrder } = sorting;

      return (
        this.find({ selector: query })
          .sort({
            [sortBy]: Number(sortOrder),
          })
          // .populate('user')
          .skip(+Number(skip))
          .limit(+Number(limit))
          .exec()
          .then(docs => {
            if (docs) {
              return Promise.all(
                docs.map(async doc => {
                  const owner = await doc.owner_;
                  let object = await doc.toJSON();

                  object.owner = owner ? owner.toJSON() : undefined;

                  return object;
                }),
              );
            }
          })
      );
    },
  },

  methods: {}, // (optional) ORM-functions for documents

  attachments: {}, // (optional) ORM-functions for attachments

  options: {
    // (optional) Custom parameters that might be used in plugins
  },
};

const hooks = {
  preInsert(data) {
    data._id = uuidv4();
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();
    return data;
  },
  preSave(data) {
    data.updatedAt = new Date().toISOString();
    return data;
  },
};

module.exports = { model, hooks };
