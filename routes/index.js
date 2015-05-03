var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Samphire Cottage Portal' });
});

/* GET enter details page */
router.get('/enterdetails', function(req, res, next){
  res.render('enterdetails', { title: 'Enter Details'});
});


/*POST to generateresponse service */
router.post('/generateresponse', function(req, res, next) {

  var insertValue = function(responseText, valueToInsert, placeholder){
    var splitText = null;
    var updatedText = "";
    
    //check to see if the placeholder exists, if not just return the unaltered response text
    if (responseText.split(placeholder).length > 1){
      splitText = responseText.split(placeholder);
			
      for (var i=0; i<splitText.length; i++){			
        if (i==(splitText.length-1)){
	  updatedText += splitText[i];
	}else{
	  updatedText += splitText[i] + valueToInsert;
	}
      }
        return updatedText;
      }else{
        return responseText;
      }	

  }  

  var template = "Dear <customerName>, Thanks for your booking on <fromDate> - <toDate>. It will cost <cost>. Thanks, <responder>";

  console.log("req.body: " + JSON.stringify(req.body));

  var customerName = req.body.customerName;
  var templateDropdown = req.body.templateDropdown;
  var fromDate = req.body.fromDate;
  var toDate = req.body.toDate;
  var cost = req.body.cost;
  var responder = req.body.responder;

  var updatedText = insertValue(template, customerName, "<customerName>");
  updatedText = insertValue(updatedText, fromDate, "<fromDate>");
  updatedText = insertValue(updatedText, toDate, "<toDate>");
  updatedText = insertValue(updatedText, cost, "<cost>");
  updatedText = insertValue(updatedText, responder, "<responder>");

  res.render('displayresponse', {response: updatedText});
});


module.exports = router;
