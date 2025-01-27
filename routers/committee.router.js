const express = require('express');
const committeeController = require('../controllers/committee.controller');
const validateApprovalCommitteeMember = require('../middlewares/validateApprovalCommitteeMember');
const checkPermissionsCommitteeMember = require('../middlewares/checkPermissionsCommitteeMember');


const committeeRouter = express.Router();

committeeRouter.get('/', committeeController.getAllCommittees);
committeeRouter.post('/:committeeId/approve', validateApprovalCommitteeMember, committeeController.approveMember);

committeeRouter.post('/:committeeId/set-head', checkPermissionsCommitteeMember, committeeController.setHead);
committeeRouter.delete('/:committeeId/members/:memberId', checkPermissionsCommitteeMember, committeeController.removeMember);

module.exports = committeeRouter;



