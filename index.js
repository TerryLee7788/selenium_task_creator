var express    = require('express'),
    bodyParser = require('body-parser'),
    fs         = require('fs'),
    hb         = require('express3-handlebars'),
    handlebars = hb.create({
      defaultLayout: 'main',
      helpers: {
        section: function (name, options) {
          if(!this._sections) { this._sections = {}; }
          this._sections[name] = options.fn(this);
          return null;
        }
      }
    }),
    app = express();

app.set('port', process.env.PORT || 3000);

// set template engine
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

/*****
 * Reference doc
 *****
 * req.body
 * > http://expressjs.com/4x/api.html#req.body
 *****/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function renderToString (source, data) {
  var template = new hb.ExpressHandlebars().handlebars.compile(source),
      out_put = template(data);
  return  out_put;
}
function checkFields (data) {
  // check main object keys value
  for (var i in data) {
    if (data[i] === '') {
      return false;
    }
    if (i === 'it') {
      var j = data[i].length;
      for (var k = 0; k < j; k++) {
        // check "it" array object keys value
        for (var l in data[i][k]) {
          if (data[i][k][l] === '') {
            return false;
          }
          if (l === 'events') {
            var h = data[i][k][l].length;
            // check "events" array object keys value
            for (var g = 0; g < h; g++) {
              for (var f in data[i][k][l][g]) {
                if (data[i][k][l][g][f] === '') {
                  return false;
                }
              }
            }
          }
        }
      }
    }
  }
  return true;
}

// set routes
app.all('/', function (req, res) {
  res.render('index');
});

app.all('/create_task.api', function (req, res) {
  var check;
  req.accepts(['html', 'json']);
  check = checkFields(req.body);

  if (!check) {
    res.json({
      error: true,
      message: 'There are some fields are empty'
    });
    return ;
  }

  if (Object.keys(req.body).length && check) {
    fs.readFile('./views/layouts/basic_task.handlebars', function (err, data) {
      if (err) { return console.log(err); }
      var source = data.toString(),
          code = renderToString(source, req.body);

      // fs.writeFile('./js_tmp/test.js', code, function (err) {
      fs.writeFile('./js_tmp/' + req.body.task_name + '.js', code, function (err) {
        if (err) { return console.log(err); }
      });
    });
  }
  res.json({
    success: true,
    message: 'Cool! Done!!!'
  });
});

app.all('/load_task', function (req, res) {
  res.render('load_task');
});

app.all('/edit_task', function (req, res) {
  res.render('edit_task');
});

app.all('/create_task', function (req, res) {
  res.render('create_task');
});

app.use(function (req, res) {
  res.status('404').render('404');
});

app.listen(app.get('port'), function () {
  console.log(' Your server started on http://localhost:' + app.get('port') + '\n press Ctrl-C to terminate.');
});