var express = require('express');
var async = require('async');
var router = express.Router();
var nano = require('nano')('http://localhost:5984');
var db = nano.use('templates');

//var nano = require('nano')('https://7ab51e51-3366-4dc9-b3cb-044a29614d24-bluemix:2461ae15212a53b34b07a12661fae7dc499289a9d36452ada8166865c654913b@7ab51e51-3366-4dc9-b3cb-044a29614d24-bluemix.cloudant.com');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Samphire Cottage Portal' });
});

/* GET enter details page */
router.get('/enterdetails', function(req, res, next){

  var templateOptions = '{"templates":['; 

  db.list(function(err, body){
    if (err) {
      console.log(err);
    }else{
        
        var listLength = body.rows.length;       

        async.each(body.rows,
           function(item, callback){
              
              var i = body.rows.indexOf(item);

              db.get(item.id, function(err, body){
              if (!err){
                 
                if (i == (listLength -1)){
                  templateOptions += '{"name":"' + body.name.toString() + '"}]}';
                }else{
                  templateOptions += '{"name":"' + body.name.toString() + '"},';
                }

              }else{
                 console.log(err);
              }
              
              callback();
              });
            },
            function(err){
               
               templateOptions = JSON.parse(templateOptions);
               console.log(templateOptions);              
               
               res.render('enterdetails', { title: 'Enter Details', templateOptions: templateOptions});
 
            }
          );
        //console.log (body.rows[i].id);
    }//end else      
  });

 
});


/*POST to generateresponse service */
router.post('/generateresponse', function(req, res, next) {

  var insertValue = function(responseText, valueToInsert, placeholder){
    console.log("placeholder: " + placeholder);	   
    var splitText = null;
    var updatedText = "";
    
    //check to see if the placeholder exists, if not just return the unaltered response text
    if (responseText.split(placeholder).length > 1){
      splitText = responseText.split(placeholder);
      console.log("found placeholder: " + placeholder);	
      		
      for (var i=0; i<splitText.length; i++){			
        if (i==(splitText.length-1)){
	  updatedText += splitText[i];
	}else{
	  updatedText += splitText[i] + valueToInsert;
	}
      }
        console.log("updatedText: " + updatedText);
        return updatedText;
     }else{
        console.log("NOT found placeholder: " + placeholder);	
        return responseText;
      }	

  }

    var template = "";


  //Get the list of templates stored in the cloudant DB
  // fetch the primary index
  db.list(function(err, body){
    if (err) {
      console.log(err);
    }else{

      var isMatch = false;
      //Loop through each of the entries in the DB
      

        async.each(body.rows,
           function(item, callback){
            //  item.checkDatabase(fuction(){

                db.get(item.id, function(err, body){
                if (!err && (isMatch==false)){
                //console.log("name: " + JSON.stringify(body.name) + " template: " + JSON.stringify(body.template));
            
                //if the template name matches one in the db then set the template
                console.log("JSON.stringify(req.body.template): " + JSON.stringify(req.body.template));
                console.log("JSON.stringify(body.name): " + JSON.stringify(body.name))
                if (JSON.stringify(req.body.template) == JSON.stringify(body.name)){
                  console.log("MATCH");
                  template = body.template.toString();
                  isMatch = true;
                }else{
                  console.log("NO MATCH");
                }         

              }else{
                console.log("*****" + err);
              }
           // });




                callback();
              });
            },
            function(err){
              console.log("template: " + template);
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
 
            }
          );
        //console.log (body.rows[i].id);
      
       

     

    }//end else      
  });


});


module.exports = router;
