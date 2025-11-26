const organizationService = require('../services/OrganizationService');

async function createOrganization(req, res) {
  try {
    const { organization_name, email, password } = req.body;

    if (!organization_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide organization_name, email, and password'
      });
    }

    const result = await organizationService.createOrganization(
      organization_name,
      email,
      password
    );

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: {
        organization: result.organization,
        admin: result.admin
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function getOrganization(req, res) {
  try {
    const { organization_name } = req.query;

    if (!organization_name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide organization_name as a query parameter'
      });
    }

    const organization = await organizationService.getOrganizationByName(organization_name);

    res.status(200).json({
      success: true,
      data: organization
    });
  } catch (error) {
    const statusCode = error.message === 'Organization not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

async function updateOrganization(req, res) {
  try {
    const { organization_name, new_organization_name, email, password } = req.body;

    if (!organization_name || !new_organization_name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide organization_name and new_organization_name'
      });
    }

    const organization = await organizationService.updateOrganization(
      organization_name,
      new_organization_name,
      email,
      password
    );

    res.status(200).json({
      success: true,
      message: 'Organization updated successfully',
      data: organization
    });
  } catch (error) {
    const statusCode = error.message.includes('Unauthorized') ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

async function deleteOrganization(req, res) {
  try {
    const { organization_name } = req.body;

    if (!organization_name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide organization_name'
      });
    }

    const result = await organizationService.deleteOrganization(organization_name);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    const statusCode = error.message === 'Organization not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  createOrganization,
  getOrganization,
  updateOrganization,
  deleteOrganization
};
