const express = require('express');
const organizationController = require('../controllers/OrganizationController');

const router = express.Router();

router.post('/create', organizationController.createOrganization);
router.get('/get', organizationController.getOrganization);
router.put('/update', organizationController.updateOrganization);
router.delete('/delete', organizationController.deleteOrganization);

module.exports = router;
