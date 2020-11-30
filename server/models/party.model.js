const { v4: uuidv4 } = require('uuid');

const partySchema = {
  title: 'party schema',
  keyCompression: false,
  version: 0,
  description: 'describes a simple party',
  type: 'object',
  required: ['name'],
  indexes: ['createdAt', '_id'],
  properties: {
    schema: {
      type: 'string',
      default: 'partySchema',
    },
    _id: {
      type: 'string',
      primary: true,
    },
    name: {
      type: 'string',
    },
    creditPeriod: {
      type: 'number',
      default: 30,
    },
    type: {
      enum: ['PARTY', 'OTHERS'],
      type: 'string',
      default: 'PARTY',
    },
    //TODO:To check whether creditor or editor , rethink the concept
    // tag: {
    //   type: Array,
    // },
    phone: {
      type: 'array',
    },
    account: {
      type: 'array',
    },
    email: {
      type: 'string',
    },
    gstNo: {
      type: 'string',
    },
    address: {
      type: 'string',
    },
    remark: {
      type: 'string',
    },
    rating: {
      type: 'number',
      default: 1,
    },
    ratingAuto: {
      type: 'number',
      default: 1,
    },
    /**
     * TODO: Modify opening to accept transaction instead of amount
     * openingBalance:-
     * Keys:
     * amount - "number":opening amount
     * transactions - [{}]: Contains array of objects having keys : statementId and amount
     * to keep record of opening amount settlement
     */
    openingBalance: {
      type: 'number',
      default: 0,
    },
    closingBalance: {
      type: 'number',
      default: 0,
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
  name: 'party',
  schema: partySchema,
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
     * Get party
     * @param {ObjectId} id - The objectId of party.
     * @returns {Promise<Party, APIError>}
     */
    getOne(id) {
      return this.findOne({ selector: { _id: id } })
        .exec()
        .then(async doc => {
          if (doc) {
            return doc.toJSON();
          }
          const err = new Error('No such Party exists!');
          return Promise.reject(err);
        });
    },

    /**
     * List partys in descending order of 'createdAt' timestamp.
     * @param {number} skip - "number" of partys to be skipped.
     * @param {number} limit - Limit number of partys to be returned.
     * @returns {Promise<Party[]>}
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
              return Promise.all(docs.map(doc => doc.toJSON()));
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
