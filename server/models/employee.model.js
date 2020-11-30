const { v4: uuidv4 } = require('uuid');

const employeeSchema = {
  title: 'employee schema',
  keyCompression: false,
  version: 0,
  description: 'describes a simple employee',
  type: 'object',
  required: ['name'],
  indexes: ['createdAt', '_id'],
  // attachments: {
  //   encrypted: false
  // },
  properties: {
    schema: {
      type: 'string',
      default: 'employeeSchema',
    },
    _id: {
      type: 'string',
      primary: true,
    },
    name: {
      type: 'string',
    },
    role: {
      type: 'string',
      enum: ['STAFF', 'DRIVER', 'OPERATOR', 'CONDUCTOR'],
      default: 'DRIVER',
    },
    phone: {
      type: 'array',
    },
    status: {
      type: 'number',
      default: 1,
    },
    account: {
      type: 'array',
    },
    salaries: {
      type: 'array',
    },
    licenseNo: {
      type: 'string',
    },
    aadharNo: {
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
    extra: {
      type: 'string',
    },
    licenseExpiryDate: {
      type: 'string',
    },
    rating: {
      type: 'number',
      default: 1,
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
  name: 'employee',
  schema: employeeSchema,
  autoMigrate: true, // <- migration will run at creation
  migrationStrategies: {
    // 1 means, this transforms data from version 0 to version 1
    // 1: function (oldDoc) {
    //   return oldDoc;
    // },
    // 2: function (oldDoc) {
    //   return oldDoc;
    // },
    // 3: function (oldDoc) {
    //   oldDoc.status = 1
    //   return oldDoc;
    // },
    // 4: function (oldDoc) {
    //   oldDoc.status = 1
    //   return oldDoc;
    // },
  },
  pouchSettings: {}, // (optional)

  statics: {
    // (optional) // ORM-functions for this collection
    /**
     * Get employee
     * @param {ObjectId} id - The objectId of employee.
     * @returns {Promise<Employee, APIError>}
     */
    getOne(id) {
      return this.findOne({ selector: { _id: id } })
        .exec()
        .then(async doc => {
          if (doc) {
            return doc.toJSON();
          }
          const err = new Error('No such Employee exists!');
          return Promise.reject(err);
        });
    },

    /**
     * List employees in descending order of 'createdAt' timestamp.
     * @param {number} skip - "number" of employees to be skipped.
     * @param {number} limit - Limit number of employees to be returned.
     * @returns {Promise<Employee[]>}
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
