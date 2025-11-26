const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const Admin = require('../models/Admin');

async function createDynamicCollection(collectionName) {
  try {
    const db = mongoose.connection.db;
    
    const collections = await db.listCollections({ name: collectionName }).toArray();
    
    if (collections.length > 0) {
      console.log(`Collection ${collectionName} already exists`);
      return;
    }

    await db.createCollection(collectionName, {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["data", "createdAt"],
          properties: {
            data: {
              bsonType: "object",
              description: "Organization-specific data"
            },
            createdAt: {
              bsonType: "date",
              description: "Creation timestamp"
            }
          }
        }
      }
    });

    console.log(`Dynamic collection created: ${collectionName}`);
  } catch (error) {
    console.error(`Error creating collection ${collectionName}:`, error.message);
    throw new Error(`Failed to create dynamic collection: ${error.message}`);
  }
}

async function cleanupCollection(collectionName) {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: collectionName }).toArray();
    
    if (collections.length > 0) {
      await db.collection(collectionName).drop();
      console.log(`Cleaned up collection: ${collectionName}`);
    }
  } catch (error) {
    console.error(` Error cleaning up collection ${collectionName}:`, error.message);
  }
}

async function createOrganization(organizationName, email, password) {
  try {
    const normalizedName = organizationName.toLowerCase().trim();
    
    const existingOrg = await Organization.findOne({ 
      organizationName: normalizedName 
    });
    
    if (existingOrg) {
      throw new Error('Organization name already exists');
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      throw new Error('Admin email already exists');
    }

    const collectionName = `org_${normalizedName}`;

    await createDynamicCollection(collectionName);

    const tempOrg = new Organization({
      organizationName: normalizedName,
      collectionName,
      adminRef: new mongoose.Types.ObjectId()
    });

    const admin = new Admin({
      email,
      password,
      organizationId: tempOrg._id
    });

    tempOrg.adminRef = admin._id;

    try {
      await admin.save();
      await tempOrg.save();
    } catch (saveError) {
      await cleanupCollection(collectionName);
      throw saveError;
    }

    return {
      organization: tempOrg,
      admin: {
        id: admin._id,
        email: admin.email
      }
    };
  } catch (error) {
    throw error;
  }
}

async function getOrganizationByName(organizationName) {
  try {
    const normalizedName = organizationName.toLowerCase().trim();
    
    const organization = await Organization.findOne({ 
      organizationName: normalizedName 
    }).populate('adminRef', 'email role createdAt');

    if (!organization) {
      throw new Error('Organization not found');
    }

    return organization;
  } catch (error) {
    throw error;
  }
}

async function migrateCollection(oldCollectionName, newCollectionName) {
  try {
    const db = mongoose.connection.db;

    const collections = await db.listCollections({ name: oldCollectionName }).toArray();
    
    if (collections.length === 0) {
      console.log(`Old collection ${oldCollectionName} does not exist, skipping migration`);
      return;
    }

    const oldCollection = db.collection(oldCollectionName);
    const documents = await oldCollection.find({}).toArray();

    await createDynamicCollection(newCollectionName);

    if (documents.length > 0) {
      const newCollection = db.collection(newCollectionName);
      await newCollection.insertMany(documents);
      console.log(`Migrated ${documents.length} documents from ${oldCollectionName} to ${newCollectionName}`);
    }

    await oldCollection.drop();
    console.log(`Dropped old collection: ${oldCollectionName}`);
  } catch (error) {
    console.error(`Error migrating collection:`, error.message);
    throw new Error(`Failed to migrate collection: ${error.message}`);
  }
}

async function updateOrganization(oldOrganizationName, newOrganizationName, email, password) {
  try {
    const normalizedOldName = oldOrganizationName.toLowerCase().trim();
    const normalizedNewName = newOrganizationName.toLowerCase().trim();

    const organization = await Organization.findOne({ 
      organizationName: normalizedOldName 
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    if (normalizedOldName !== normalizedNewName) {
      const existingOrg = await Organization.findOne({ 
        organizationName: normalizedNewName 
      });
      
      if (existingOrg) {
        throw new Error('New organization name already exists');
      }

      const oldCollectionName = organization.collectionName;
      const newCollectionName = `org_${normalizedNewName}`;

      await migrateCollection(oldCollectionName, newCollectionName);

      organization.organizationName = normalizedNewName;
      organization.collectionName = newCollectionName;
      organization.metadata.updatedAt = Date.now();
    }

    const admin = await Admin.findById(organization.adminRef);

    if (email && email !== admin.email) {
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin && existingAdmin._id.toString() !== admin._id.toString()) {
        throw new Error('Email already in use');
      }
      admin.email = email;
    }

    if (password) {
      admin.password = password;
    }

    await admin.save();
    await organization.save();

    return organization;
  } catch (error) {
    throw error;
  }
}

async function deleteOrganization(organizationName) {
  try {
    const normalizedName = organizationName.toLowerCase().trim();

    const organization = await Organization.findOne({ 
      organizationName: normalizedName 
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    const db = mongoose.connection.db;
    const collectionName = organization.collectionName;
    
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length > 0) {
      await db.collection(collectionName).drop();
      console.log(`Dropped collection: ${collectionName}`);
    }

    await Admin.findByIdAndDelete(organization.adminRef);
    await Organization.findByIdAndDelete(organization._id);

    return { message: 'Organization and associated data deleted successfully' };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createOrganization,
  getOrganizationByName,
  updateOrganization,
  deleteOrganization,
  createDynamicCollection,
  migrateCollection,
  cleanupCollection
};
