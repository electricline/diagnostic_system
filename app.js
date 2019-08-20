var express = require('express')
  , http = require('http')
  , app = express()
  , server = http.createServer(app)
  , mysql = require('mysql')
  , dbconfig = require('./config/database.js')
  , connection = mysql.createConnection(dbconfig)
  , bodyParser = require('body-parser')
  

var path = require('path')
var fs = require('fs')
// prepare server
app.use(express.static('public'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS 
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery 
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine', 'ejs')  

app.get('/', function (req, res) {
  // var Rdata = fs.readFileSync('./Ruleset_simple.txt', { encoding: 'utf8' });
  // var ruleArray = Rdata;
  // res.render(__dirname+'/views/main', { ruledata: ruleArray});
  var query = 'select * from ruleset';

  connection.query(query, function(err, ruleset){
    if(err) throw err;
    
    var ruleArray = ruleset;
    
    res.render(__dirname+'/views/main', { ruledata: ruleArray});

  })
});

// app.post('/', function (req, res) {
//   var query = 'select * from ruleset';

//   connection.query(query, function(err, ruleset){
//     if(err) throw err;

//     console.log('POST Parameter = ', ruleset);

//   })
// })

app.get('/persons', function(req, res){

    connection.query('select age from rawdata', function(err, rows){
    if(err) throw err;

    console.log('The solution is: ', rows);
    res.send(rows);
  });
});

app.get('/test', function(req, res){

  var id = req.query.id;

  connection.query('select * from rawdata where age=' + id, function(err, rows){
  if(err) throw err;

  console.log('The solution is: ', rows);
  res.send(rows);
  });
});

//AJAX POST METHOD
app.get('/api/get', function(req, res){
  var data = req.query.data;
  console.log('GET Parameter = ' + data);

  var result = data + ' Succese';
  console.log(result);

  res.send({result:result});

});

app.post('/histogram', function(req, res){

  var data = req.body.data;

  var query = 'select ' + data + ' as data, count(' + data + ') as num from rawdata group by '+data +';' +
  'select ' + data + ' from contents'


  connection.query(query, function(err, rows){
    if(err) throw err;

    console.log('POST Parameter = ', rows);

    res.json({rows})
  })


  // var result = data + ' 호호하하';
  // console.log(result);
  // res.send({result:result});

})

app.post('/scatter', function(req, res){
  
  var data = req.body.data;
  console.log(data[0]);
  var query = 'select ' + data[0] + ' as x_name, ' + data[1] + ' as y_name from rawdata;' +
  'select ' + data[0] + ' as x_name, ' + data[1] + ' as y_name from contents'

  connection.query(query, function(err, rows){
    if(err) throw err;
    
    console.log(rows);

    res.json({rows})
  })

})

app.post('/statistic',function(req, res){
    var data = req.body.data;
    var query = 'select ' + data + ' as data, count(Q69_d) as Occupation from rawdata where Q69_d = "yes" group by '+ data +' order by ' + data + ';'+
                'select ' + data + ' as data, count(Q69_d) as nonOccupation from rawdata where Q69_d = "no" group by '+ data +' order by ' + data + ';'+
                'select ' + data + ' as data, count('+data+') as Count from rawdata group by '+ data +' order by ' + data + ';'
    
    connection.query(query, function(err, rows){
      if(err) throw err;
      console.log('statistic: ', rows);
      res.json({rows})
    
    })
})


server.listen(3333, function() {
  console.log('Express server listening on port ' + server.address().port);
});