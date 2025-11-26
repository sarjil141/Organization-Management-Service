const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  organizationName: {
    type: String,
    required: [true, 'Organization name is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9_-]+$/, 'Organization name can only contain lowercase letters, numbers, hyphens, and underscores']
  },
  collectionName: {
    type: String,
    required: true,
    unique: true
  },
  adminRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  connectionDetails: {
    database: {
      type: String,
      default: 'organization_master'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    }
  },
  metadata: {
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

organizationSchema.pre('save', function(next) {
  this.metadata.updatedAt = Date.now();
  next();
});

organizationSchema.methods.toJSON = function() {
  const obj = this.toObject();
  return {
    organizationName: obj.organizationName,
    collectionName: obj.collectionName,
    connectionDetails: obj.connectionDetails,
    createdAt: obj.metadata.createdAt,
    updatedAt: obj.metadata.updatedAt
  };
};

module.exports = mongoose.model('Organization', organizationSchema);
