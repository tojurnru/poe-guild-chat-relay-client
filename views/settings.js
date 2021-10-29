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
    GUILD_TAG: $('#input-guild-tag').val(),
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
  const {
    productName,
    CLIENTTXT_PATH,
    POE_WINDOW_TITLE,
    DEBUG,
    URL,
    GUILD_TAG,
  } = config;

  $('#menubar-title').html(`${productName} - Settings`);
  $('#input-clienttxt-text').val(CLIENTTXT_PATH);
  $('#input-poe-window-title').val(POE_WINDOW_TITLE);
  $('#input-debug').prop('checked', DEBUG);
  $('#input-url').val(URL);
  $('#input-guild-tag').val(GUILD_TAG);
});

ipcRenderer.on('web-server-info', (event, serverInfo = {}) => {
  const { status, code, clients, received } = serverInfo;
  const date = new Date();
  const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

  let html = '';

  if (status === 200) {
    html += `Connected (${time})<br>`;
    html += `Clients Online: ${clients}<br>`;
  } else {
    html += `NOT CONNECTED (${time})<br>`;
    html += `Error Code: ${code}<br>`;
    html += `HTTP Status: ${status}<br>`;
  }

  html += `Chat Sent: ${received}<br>`;

  $('#container-info').html(html);
});
