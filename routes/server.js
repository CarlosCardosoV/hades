var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Server for socket.io');
});


/*POST SERVER*/
router.post('/', function(req, res, next){
	res.send('Server post socket.io')
})


module.exports = router;
