const express = require('express');
const router  = express.Router();
const { getAllEvents, getEventById, getCategories } = require('../controllers/eventsController');

router.get('/',           getAllEvents);
router.get('/categories', getCategories);
router.get('/:id',        getEventById);

module.exports = router;
