const router  = require('express').Router();
const ctrl    = require('../controllers/productController');
const { authAdmin }        = require('../middleware/auth');
const { uploadProductImage } = require('../middleware/upload');

router.get('/',     ctrl.getAll);                                    // publik
router.get('/:id',  ctrl.getOne);                                    // publik
router.post('/',    authAdmin, uploadProductImage, ctrl.create);     // admin
router.put('/:id',  authAdmin, uploadProductImage, ctrl.update);     // admin
router.delete('/:id', authAdmin, ctrl.remove);                       // admin

module.exports = router;
