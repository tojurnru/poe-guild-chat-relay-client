const { ipcRenderer } = require('electron');

// button handling

$('#button-close').on('click', function(e) {
  ipcRenderer.send('web-settings-close');
});

$('#button-cancel').on('click', function(e) {
  ipcRenderer.send('web-settings-close');
});

$('#button-save').on('click', function (e) {
  const config = {
    CLIENTTXT_PATH: $('#input-clienttxt-text').val(),
    POE_WINDOW_TITLE: $('#input-poe-window-title').val(),
    DEBUG: $('#input-debug').is(":checked"),
    URL: $('#input-url').val(),
    TOKEN: $('#input-token').val(),
  }

  ipcRenderer.send('web-settings-close', true, config);
});

$('#input-clienttxt-file').on('change', function (e) {
  const fileObject = e.target.files[0];
  if (fileObject) {
    $('#input-clienttxt-text').val(fileObject.path);
  }
});

// web event handling

ipcRenderer.on('web-settings', (event, config) => {
  $('#menubar-title').html(`${config.productName} - Settings`);
  $('#input-clienttxt-text').val(config.CLIENTTXT_PATH);
  $('#input-poe-window-title').val(config.POE_WINDOW_TITLE);
  $('#input-debug').prop('checked', config.DEBUG);
  $('#input-url').val(config.URL);
  $('#input-token').val(config.TOKEN);
});
