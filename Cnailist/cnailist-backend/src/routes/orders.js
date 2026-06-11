const router  = require('express').Router();
const ctrl    = require('../controllers/orderController');
const { authAdmin }          = require('../middleware/auth');
const { uploadPaymentProof } = require('../middleware/upload');

router.get('/stats',        authAdmin, ctrl.getStats);                    // admin
router.get('/',             authAdmin, ctrl.getAll);                      // admin
router.get('/:id',          authAdmin, ctrl.getOne);                      // admin
router.post('/',            uploadPaymentProof, ctrl.create);             // publik
router.put('/:id/status',   authAdmin, ctrl.updateStatus);                // admin
router.delete('/:id',       authAdmin, ctrl.remove);                      // admin

module.exports = router;
