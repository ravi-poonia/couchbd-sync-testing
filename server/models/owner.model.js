const { v4: uuidv4 } = require('uuid');

const ownerSchema = {
  title: 'owner schema',
  keyCompression: false,
  version: 0,
  description: 'describes a simple owner',
  type: 'object',
  required: ['name'],
  indexes: ['createdAt', '_id'],
  // attachments: {
  //   encrypted: false
  // },
  properties: {
    schema: {
      type: 'string',
      default: 'ownerSchema',
    },
    _id: {
      type: 'string',
      primary: true,
    },
    name: {
      type: 'string',
    },
    panNo: {
      type: 'string',
    },
    email: {
      type: 'string',
    },
    gstNo: {
      type: 'string',
    },
    aadharNo: {
      type: 'string',
    },
    pan: {
      type: 'string',
    },
    profilePic: {
      type: 'string',
    },
    aadhar: {
      type: 'string',
    },
    license: {
      type: 'string',
    },
    gst: {
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
  name: 'owner',
  schema: ownerSchema,
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
     * Get owner
     * @param {ObjectId} id - The objectId of owner.
     * @returns {Promise<Owner, APIError>}
     */
    getOne(id) {
      return this.findOne({ selector: { _id: id } })
        .exec()
        .then(async doc => {
          if (doc) {
            return doc.toJSON();
          }
          const err = new Error('No such Owner exists!');
          return Promise.reject(err);
        });
    },

    /**
     * List owners in descending order of 'createdAt' timestamp.
     * @param {number} skip - Number of owners to be skipped.
     * @param {number} limit - Limit number of owners to be returned.
     * @returns {Promise<Owner[]>}
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
                  return doc.toJSON();
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
