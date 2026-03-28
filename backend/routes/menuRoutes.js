const express = require('express');
const router = express.Router();
const {
    getMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability
} = require('../controllers/menuController');

router.route('/')
    .get(getMenuItems)
    .post(createMenuItem);

router.route('/:id')
    .get(getMenuItem)
    .put(updateMenuItem)
    .delete(deleteMenuItem);

router.patch('/:id/toggle', toggleAvailability);

module.exports = router;