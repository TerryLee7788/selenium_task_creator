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
        },
        json: function (context) {
          return JSON.stringify(context);
        },
        selected: function (partial, by) {
          var txt     = fs.readFileSync(__dirname + '/views/partials/' + partial + '.handlebars').toString(),
              loc     = txt.indexOf(by) + by.length + 1,
              start   = txt.slice(0, loc ),
              end     = txt.slice(loc , txt.length),
              new_txt = start + ' selected' + end;

          return new_txt;
        }
      }
    }),
    hb_compile = new hb.ExpressHandlebars().handlebars.compile,
    app = express();

app.set('port', process.env.PORT || 3000);

// set template engine
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));
app.use(function (req, res, next) {
  res.locals.nav_back = app.get('back') || req.query.sub_page === '1';
  next();
});

/*****
 * Reference doc
 *****
 * req.body
 * > http://expressjs.com/4x/api.html#req.body
 *****/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function renderToString (source, data) {
  var template = hb_compile(source),
      out_put = template(data);
  return  out_put;
}
function checkData (data) {
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
function getRouteFiles (route, type) {
  var arr_file = [];
  // fs.readdirSync(path), return an array
  fs.readdirSync(route).filter(function (file) {
    return file.substr(-3) === '.' + type;
  }).forEach(function (file) {
    arr_file.push(file);
  });
  return arr_file;
}
function writeFile (file, code) {
  var route = ['./js_tmp/', './json_tmp/'],
      js_reg = /(.js)$/,
      json_reg = /(.json)$/;

  if (file.match(js_reg)) {
    route = './js_tmp/';
  } else if (file.match(json_reg)) {
    route = './json_tmp/';
  }

  fs.writeFile(route + file, code, function (err) {
    if (err) { return console.log(err); }
  });
}

// set routes
app.all('/', function (req, res) {
  res.render('index');
});

app.all('/create_task.api', function (req, res) {
  var task_layout = './views/layouts/basic_task.handlebars',
      js_file = req.body.task_name + '.js',
      json_file = req.body.task_name + '.json',
      json_code = JSON.stringify(req.body),
      obj = { js: {}, json: {} },
      check, source = '', js_code = '', i;

  req.accepts(['html', 'json']);
  check = checkData(req.body);

  if (!check) {
    res.json({
      error: true,
      message: 'There are some fields are empty'
    });
    return ;
  }

  if (Object.keys(req.body).length && check) {
    source = fs.readFileSync(task_layout).toString();
    js_code = renderToString(source, req.body);

    obj.js.name = js_file;
    obj.js.code = js_code;
    obj.json.name = json_file;
    obj.json.code = json_code;

    // writeFile
    for (i in obj) {
      writeFile(obj[i].name, obj[i].code);
    }
  }
  res.json({
    success: true,
    message: 'Nice job! Done!!!'
  });
});

app.all('/save_task.api', function (req, res) {
  res.json({
    success: true,
    message: 'Task saved.'
  });
});

app.all('/load_task', function (req, res) {
  res.render('load_task');
});

app.all('/edit_task', function (req, res) {
  var js_file = getRouteFiles('./js_tmp', 'js');

  res.render('edit_task', {
    files: js_file
  });
});

app.all('/edit_task/:file', function (req, res) {
  var file = req.params.file,
      json_name = file.replace('.js', '') + '.json',
      json_data = JSON.parse(fs.readFileSync('./json_tmp/' + json_name).toString());

  res.render('edit_file', {
    file: file,
    json: json_data
  });
});

app.all('/create_task', function (req, res) {
  res.render('create_task');
});

app.use(function (req, res) {
  res.status('404').render('404');
});

app.use(function (req, res) {
  res.status('500').render('500');
});

app.listen(app.get('port'), function () {
  console.log(' Your server started on http://localhost:' + app.get('port') + '\n press Ctrl-C to terminate.');
});