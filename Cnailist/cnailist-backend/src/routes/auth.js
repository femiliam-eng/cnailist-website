const router     = require('express').Router();
const ctrl       = require('../controllers/authController');
const { authAdmin } = require('../middleware/auth');

router.post('/login',           ctrl.login);
router.get('/me',    authAdmin, ctrl.me);
router.put('/change-password', authAdmin, ctrl.changePassword);

module.exports = router;
