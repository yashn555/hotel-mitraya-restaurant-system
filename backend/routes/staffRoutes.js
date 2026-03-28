const express = require('express');
const router = express.Router();
const {
    getStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff
} = require('../controllers/staffController');

router.route('/')
    .get(getStaff)
    .post(createStaff);

router.route('/:id')
    .get(getStaffById)
    .put(updateStaff)
    .delete(deleteStaff);

module.exports = router;