const express = require('express');
const router = express.Router();
const {
    getOrders,
    getOrdersByStatus,
    getOrderByTable,
    createOrder,
    updateOrder,
    markAsReady,
    markAsPaid,
    deleteOrder,
    updateKitchenStatus,
    markAsServed,
    startEating,
    addItemsToOrder,
    updatePrepaid
} = require('../controllers/orderController');

router.route('/')
    .get(getOrders)
    .post(createOrder);

router.get('/status/:status', getOrdersByStatus);
router.get('/table/:tableNumber', getOrderByTable);

router.route('/:id')
    .put(updateOrder)
    .delete(deleteOrder);

router.patch('/:id/ready', markAsReady);
router.patch('/:id/paid', markAsPaid);
router.patch('/:id/kitchen-status', updateKitchenStatus);
router.patch('/:id/serve', markAsServed);
router.patch('/:id/start-eating', startEating);
router.post('/:id/add-items', addItemsToOrder);
router.patch('/:id/prepaid', updatePrepaid);

module.exports = router;