var lib_list = require('../../lib/basic_libs').lib(global);

test.describe('Test my first task!!', function() {
  var url = 'http://www.ffn.com',
      lang = '?lang=spanish',
      driver,

  tryAsyn = function (done) {
    var timer = 2000,
        second = (timer / 1000);
    console.log('Test my first task!! test will start after ' + second + ((second >= 10) ? (' seconds') : (' second')) );
    
    // if a function is asyn, simply accept a callback argument
    setTimeout(done, timer);
    // Test will started after "timer" seconds
  },
  checkTitle = function (title) {
    return until.titleContains(title);
  };

  /* 
   * specify the timeout on the test
   * or you can just ("mocha test.js --timeout 15000" / "mocha test.js -t 15000")
   */
  this.timeout(current_timer);

  test.before(function () {
    driver = new webdriver.Builder().
              forBrowser('chrome').
              build();
  });

  test.after(function () {
    driver.close();
  });

  test.beforeEach(tryAsyn);

  test.afterEach(function () {
    console.log('Test my first task!! test end');
  });

  test.it('Try to open google web', function() {

    // set full screen
    driver.manage().window().maximize();

    // Go the "url" page
    driver.get(url + lang);

    // try to checking things
    driver.findElement(By.name('q')).sendKeys(['webdriver' + Key.ESCAPE]);

    // The "click" means "mouse click"
    driver.findElement(By.name('btnK')).click();

    driver.wait(checkTitle('webdriver'), 5000, 'checking title end.');
    driver.getTitle().then(function (title) {
      console.log('Current page title: ' + title);
    });

  });
});