document.addEventListener('DOMContentLoaded', function() {
  var save_as_text_button = document.getElementById('save-as-text');
  var save_as_csv_button  = document.getElementById('save-as-csv');
  var save_as_json_button = document.getElementById('save-as-json');
  var save_to_zip_button  = document.getElementById('save-to-zip');
  var format_date = function(date) {
    return date.getFullYear().toString() + '-' +
           ('0'+(date.getMonth()+1).toString()).slice(-2) + '-' +
           ('0'+(date.getDate()).toString()).slice(-2) +
           ' ' + ('0'+date.getHours().toString()).slice(-2) +
           ('0'+date.getMinutes().toString()).slice(-2);
  };
  var to_csv_field = function(str) {
    return '"' + str.replace(/"/g, '""') + '"';
  };
  var get_tabs = function() {
    return new Promise(function(resolve) {
      window_opts = { populate: true, windowTypes: ['normal'] };
      chrome.windows.getAll(window_opts, function(windows) {
        resolve(_.flatten(windows.map(function(window) { return window.tabs; })).filter(function(tab) { return typeof tab.url !== 'undefined' && tab.url !== ''; }));
      });
    });
  };
  save_as_text_button.addEventListener('click', function() {
    get_tabs().then(function(tabs) {
      var blob = new Blob([tabs.map(function(tab) { return tab.title + ' ' + tab.url; }).join('\n')], {type: 'text/plain'});
      var filename = 'chrome-tabs-' + format_date(new Date()) + '.txt';
      saveAs(blob, filename);
    });
  }, false);
  save_as_csv_button.addEventListener('click', function() {
    get_tabs().then(function(tabs) {
      var blob = new Blob([tabs.map(function(tab) { return [ to_csv_field(tab.title), to_csv_field(tab.url)].join(',') }).join('\n')], {type: 'text/csv'});
      var filename = 'chrome-tabs-' + format_date(new Date()) + '.csv';
      saveAs(blob, filename);
    });
  }, false);
  save_as_json_button.addEventListener('click', function() {
    get_tabs().then(function(tabs) {
      var blob = new Blob([JSON.stringify(tabs.map(function(tab) { return _.pick(tab, [ 'title', 'url' ]); }))], {type: 'application/json'});
      var filename = 'chrome-tabs-' + format_date(new Date()) + '.json';
      saveAs(blob, filename);
    });
  }, false);
  save_to_zip_button.addEventListener('click', function() {
    var zip = new JSZip();
    get_tabs().then(function(tabs) {
      tabs = _.uniqBy(tabs, 'url');
      var data = _.groupBy(tabs, function(tab) {
        var domain_name = tab.url.toString().replace(/^(https?):\/\//, '');;
        var slash_index = domain_name.indexOf('/');
        if (slash_index >= 0) {
          domain_name = domain_name.slice(0, slash_index);
        }
        return domain_name;
      });
      Object.keys(data).forEach(function(key) {
        var sanitized_key = key.replace(/[^\w\s.]/g);
        data[key].forEach(function(tab) {
          var shortcut = '[InternetShortcut]\nURL=' + tab.url;
          var title = _.trim(tab.title.replace(/[^\w\s]/gi, '').slice(0, 255));
          zip.folder(sanitized_key).file(title + '.url', shortcut);
        });
      });
      zip.generateAsync({type: 'blob'}).then(function(content) {
        saveAs(content, 'chrome-tabs-' + format_date(new Date()) + '.zip');
      });
    });
  }, false);
}, false);
