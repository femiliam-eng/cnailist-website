const router  = require('express').Router();
const ctrl    = require('../controllers/customOrderController');
const { authAdmin }          = require('../middleware/auth');
const { uploadCustomImages } = require('../middleware/upload');

router.get('/',               authAdmin, ctrl.getAll);                    // admin
router.get('/:id',            authAdmin, ctrl.getOne);                    // admin
router.post('/',              uploadCustomImages, ctrl.create);           // publik
router.put('/:id/status',     authAdmin, ctrl.updateStatus);              // admin
router.delete('/:id',         authAdmin, ctrl.remove);                    // admin

module.exports = router;
