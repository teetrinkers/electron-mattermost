'use strict';

var remote = require('remote');
var url = require('url');

var contextMenu = require('./context-menu');

var webView = document.getElementById('mainWebview');

try {
  var configFile = remote.require('app').getPath('userData') + '/config.json';
  var config = require(configFile);
  if (config.url) {
    webView.setAttribute('src', config.url);
  }
  else {
    throw 'URL is not configured';
  }
}
catch (e) {
  window.location.href = './settings.html';
}

// Keep the focus on the webview.
// Without this, the webview loses focus when switching to another app and back.
window.addEventListener('focus', function(e) {
  webView.focus();
});

var menu = contextMenu.createDefault();
window.addEventListener('contextmenu', function(e) {
  menu.popup(remote.getCurrentWindow());
}, false);

webView.addEventListener('page-title-set', function(e) {
  document.title = e.title;
});

// Open external link in default browser.
webView.addEventListener('new-window', function(e) {
  var currentUrl = url.parse(webView.getUrl());
  var destUrl = url.parse(e.url);
  // Open in browserWindow. for exmaple, attached files.
  if (currentUrl.host === destUrl.host) {
    window.open(e.url, 'Mattermost');
  }
  else {
    require('shell').openExternal(e.url);
  }
});

// Count unread channels.
var timer = setInterval(function() {
  webView.send('retrieveUnreadCount');
}, 1000);

var showUnreadBadge = function(unreadCount) {
  switch (process.platform) {
    case 'win32':
      var window = remote.getCurrentWindow();
      if (unreadCount > 0) {
        window.setOverlayIcon(__dirname + '/badge.png', 'You have unread channels.');
      }
      else {
        window.setOverlayIcon(null, '');
      }
      break;
    case 'darwin':
      var app = remote.require('app');
      if (unreadCount > 0) {
        app.dock.setBadge(unreadCount.toString());
      }
      else {
        app.dock.setBadge('');
      }
      break;
    default:
  }
};

webView.addEventListener('ipc-message', function(event) {
  switch (event.channel) {
    case 'retrieveUnreadCount':
      var unreadCount = event.args[0];
      showUnreadBadge(unreadCount);
      break;
  }
});
