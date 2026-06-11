const router = require('express').Router();
const ctrl   = require('../controllers/customerController');
const { authAdmin } = require('../middleware/auth');

router.get('/',                 authAdmin, ctrl.getAll);          // admin
router.get('/:id',              authAdmin, ctrl.getOne);          // admin
router.post('/register',        ctrl.register);                   // publik
router.post('/login',           ctrl.login);                      // publik
router.put('/:id/status',       authAdmin, ctrl.updateStatus);    // admin
router.delete('/:id',           authAdmin, ctrl.remove);          // admin

module.exports = router;
