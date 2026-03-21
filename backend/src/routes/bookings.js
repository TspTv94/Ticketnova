const express = require('express');
const router  = express.Router();
const { createBooking, getAllBookings, getBookingById, cancelBooking } = require('../controllers/bookingsController');

router.post('/',      createBooking);
router.get('/',       getAllBookings);
router.get('/:id',    getBookingById);
router.delete('/:id', cancelBooking);

module.exports = router;
