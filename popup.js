document.addEventListener('DOMContentLoaded', function() {
  var checkPageButton = document.getElementById('saveTabs');
  var format_date = function(date) {
    return date.getFullYear().toString() + '-' +
           ('0'+(date.getMonth()+1).toString()).slice(-2) + '-' +
           date.getDate().toString() +
           ' ' + ('0'+date.getHours().toString()).slice(-2) +
           ('0'+date.getMinutes().toString()).slice(-2);
  };
  checkPageButton.addEventListener('click', function() {
    window_opts = { populate: true, windowTypes: ['normal'] };
    chrome.windows.getAll(window_opts, function(windows) {
      var tabs = _.flatten(windows.map(function(window) { return window.tabs; })).filter(function(tab) { return typeof tab.url !== 'undefined' && tab.url !== ''; });
      var blob = new Blob([tabs.map(function(tab) { return tab.title + ' ' + tab.url; }).join('\n')], {type: 'text/plain'});
      var filename = 'chrome-tabs-' + format_date(new Date()) + '.txt';
      saveAs(blob, filename);
    });
  }, false);
}, false);
