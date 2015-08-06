$(function () {
  var tasks = tasks || {},
      $task_form = $('#task_form'),
      $hide = $('#hide'),
      $err_msg = $('#error-msg'),
      $suc_msg = $('#success-msg'),
      $obj = {
        btn:       $task_form.find('#btn'),
        describe:  $task_form.find('#describe'),
        url:       $task_form.find('#url'),
        lang:      $task_form.find('#lang'),
        add:       $task_form.find('#add'),
        account:   $task_form.find('#test_account'),
        steps:     $task_form.find('#create_step')
      },
      lock_ajax = false,
      cache_step = $obj.steps.html(),
      cache_action = $hide.find('.action').html(),
      cache_check = $hide.find('.check').html(),
      cache_basic = $hide.find('.basic').html(),
      cache_sendkeys = $hide.find('.sendKeys').html(),
      cache_list = $obj.steps.find('.lists-content').html(),
  disableBtn = function (data) {
    if (data.success) {
      $obj.btn.text('Created');
      $suc_msg.text(data.message).fadeIn().delay(3000).fadeOut();
    } else {
      $err_msg.text(data.message).fadeIn(1500, function () {
        $obj.btn.prop('disabled', true);
      }).delay(3000).fadeOut(1500, function () {
        $obj.btn.prop('disabled', false);
        lock_ajax = false;
      });
    }
  },
  createTask = function () {
    // disabled the btn
    $obj.btn.prop('disabled', true);

    // lock the ajax function
    if (lock_ajax) { return; }
    lock_ajax = true;

    // setup the config object
    renderData();

    // send ajax
    $.ajax({
      type: 'post',
      url: '/create_task.api',
      dataType: 'json',
      data: tasks.config,
      success: disableBtn
    });
  },
  addSteps = function () {
    $obj.steps.append(cache_step);
  },
  deleteStep = function () {
    $(this).parents('.it_content').remove();
  },
  typeOnChange = function () {
    var $this = $(this),
        $type_content = $this.parent('label').next('.type_content'),
        val = $this.val(),
        html = '';

      switch(val) {
        case 'action':
          html = cache_action;
          break;
        case 'check':
          html = cache_check;
          break;
        case 'basic':
          html = cache_basic;
          break;
        default:
          html = cache_action;
          break;
      }
      $type_content.html(html);
  },
  addOrDeleteList = function (e) {
    e.preventDefault();
    var $this = $(this),
        $content = $this.parents('.lists-content'),
        $lists = $this.parents('[data-tag="lists"]'),
        data_action = $this.data('move');

    if (data_action === 'add') {
      $lists.after(cache_list);
    } else {
      $lists.remove();
    }
  },
  actionOnChange = function () {
    var $this = $(this),
        $sibling_span = $this.next('span'),
        content = cache_sendkeys,
        action_val = $this.val(),
        valid_target = /^(sendKey|elementTextContains)$/;

    if (valid_target.test(action_val)) {
      $sibling_span.html(content);
    } else {
      $sibling_span.html('');
    }
  },
  resetCheckBox = function () {
    var $this = $(this),
        target = $this.data('target');
    // reset account value
    if (!$this.prop("checked")) {
      $('[data-label="'+ target +'"]').find('input').each(function (idx, tar) {
        $(tar).val('');
      });
    }
  },
  renderData = function () {
    $('#basic_info').find('[name]').each(function (idx) {
      var $this = $(this),
          cur_name = $this.attr('name'),
          value = (cur_name === 'test_account') ? ($this.prop('checked')) : ($this.val());

      tasks.config[cur_name] = value;
    });

    if (tasks.config.test_account === false) {
      delete tasks.config.user;
      delete tasks.config.password;
    }

    $('.it_content').each(function (outer_idx) {
      var $current = $(this).find('[name="it_name"]'),
          it_name = $current.attr('name'),
          it_des = $current.val(),
          arr = []; // "arr" array reset

      tasks.config.it[outer_idx] = {};

      $(this).find('[data-tag="lists"]').each(function (index) {
        var out_idx = index;
        arr[out_idx] = {};

        $(this).find('[name]').each(function (idx, target) {
          var name = $(this).attr('name'),
              val = $(target).val(),
              basic_item = /^(reg|order|login)$/,
              boolean_value = /^(type|actions|functions)$/;

          if (boolean_value.test(name)) {
            arr[out_idx][val] = true;
          } else if (basic_item.test(name)) {
            if ($(target).prop('checked')) {
              arr[out_idx][name] = $(target).prop('checked');
            }
          } else {
            arr[out_idx][name] = val;                
          }
        });
      });
      // create "events" array object
      tasks.config.it[outer_idx]["events"] = arr;
      tasks.config.it[outer_idx][it_name] = it_des;
    });
    console.log(tasks.config);
  };

  // Main object
  tasks.config = {};
  tasks.config.it = [];

  // Click event
  $obj.btn.on('click', createTask);
  $obj.add.on('click', addSteps);
  $obj.steps.on('click', '.delete', deleteStep);
  $obj.steps.on('click', '[data-move]', addOrDeleteList);

  // Change event
  $obj.account.on('change', resetCheckBox);
  $obj.steps.on('change', '[name="type"]', typeOnChange);
  $obj.steps.on('change', '[data-action]', actionOnChange);
});