var express = require('express');
var router = express.Router();
const indicative = require('indicative')
//class
var Openpay = require('openpay');
//instantiation
var openpay = new Openpay('m8e9c6cld7mz8i0vgwox', 'sk_6085ae77df9c4ce7b091007cfac68dec');


function addCard(req, res, next){
  var rules = {
    'name': 'required',
    'lastname': 'required',
    'email': 'required',
    'card_number':'required',
    'holder_name':'required',
    'expiration_year':'required',
    'expiration_month':'required',
    'cvv2':'required',
    'device_session_id':'required'
  }
  indicative.validate(req.body, rules)
  .then(() => {
    var dataCustomer = {
      'name': req.body.name,
      'email': req.body.email,
      'lastname': req.body.lastname
    }
    openpay.customers.create(dataCustomer, (error, customer) => {
      if(error){
        res.send({status:"ERROR", data: error})
      }else{
        const cusId = customer.id
        var cardRequest = {
          'card_number':req.body.card_number,
          'holder_name':req.body.holder_name,
          'expiration_year':req.body.expiration_year,
          'expiration_month':req.body.expiration_month,
          'cvv2':req.body.cvv2,
          'device_session_id':req.body.device_session_id
        }
        openpay.customers.cards.create(cusId, cardRequest, function(error, card)  {
          if(error){
            openpay.customers.delete(cusId, function(errorDelete) {
              if(errorDelete){
                res.send({status:"ERROR", msg:"No se creo el metodo de pago para el cliente "+ cusId, data:errorDelete})
              }else{
                res.send({status:"ERROR", data: error})
              }
            });
          }else{
            res.send({status:"OK", msg:"Se ha agregado con exito la tarjeta", data:{customer: customer, card:card}})
          }
        });
      }
    });
  })
  .catch((errors) => {
    res.send({status:"ERROR", data:errors})
  })
}

function charge(req, res, next){
  var rules = {
    'card_id':'required',
    'amount': 'required',
    'description': 'required',
    'device_session_id':'required',
    'customer_id':'required',
    'currency':'required'
  }
  indicative.validate(req.body, rules)
  .then(() => {
    var customerId = req.body.customer_id;
    var chargeRequest = {
      'source_id':req.body.card_id,
      'method':"card",
      'amount': req.body.amount,
      'description': req.body.description,
      'device_session_id':req.body.device_session_id,
      'currency':req.body.currency //MXN, USD
    }
    openpay.customers.charges.create(customerId, chargeRequest, (error, charge) => {
      if(error){
        res.send({status:"ERROR", data: error})
      }else{
        res.send({status:"OK", data:{charge: charge}})
      }
    });
  })
  .catch(error =>{
    res.send({status:"OK", data: error})
  })
}

/* POST add new card */
router.post('/addNewCard', function(req, res, next) {
  addCard(req, res, next);
});


/* POST add card */
router.post('/addCard', (req, res, next) => {
  var rules = {
    'card_number':'required',
    'holder_name':'required',
    'expiration_year':'required',
    'expiration_month':'required',
    'cvv2':'required',
    'device_session_id':'required',
    'customer_id':'required'
  }
  indicative.validate(req.body, rules)
  .then(() => {
    var cardRequest = {
      'card_number':req.body.card_number,
      'holder_name': req.body.holder_name,
      'expiration_year': req.body.expiration_year,
      'expiration_month': req.body.expiration_month,
      'device_session_id':req.body.device_session_id,
      'cvv2':req.body.cvv2,
      'customer_id':req.body.customer_id
    }
    openpay.customers.cards.create(req.body.customer_id, cardRequest, (error, card) => {
      if(error){
        res.send({status:"ERROR", data:error})
      }else{
        res.send({status:"OK", data:{card:card}})
      }
    })
  })
  .catch(err => {
    res.send({status:"ERROR", data:err})
  })
})

/* POST make charge */
router.post('/charge', function(req, res, next) {
  charge(req, res, next)
})

/* GET lis of charges of a specific customer */
router.get('/infoCharges/:customerId', (req, res, next) => {
  const cusId = req.params.customerId;
  openpay.customers.charges.list(cusId, (error, chargesList) => {
    if(error){
      res.send({status:"ERROR", data: error })
    }else{
      res.send({status:"OK", data:{chagesList: chargesList}})
    }
  });
})

/* GET lis of cards of a specific customer */
router.get('/infoCards/:customerId', (req, res, next) => {
  const cusId = req.params.customerId;
  openpay.customers.cards.list(cusId,(error, cardsList) => {
    if(error){
      res.send({status:"ERROR", data: error })
    }else{
      res.send({status:"OK", data:{cardsList: cardsList}})
    }
  });
})

module.exports = router;
