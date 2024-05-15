const setURL = () =>
  P.set('glitchURL', 'https://conscious-modern-almandine.glitch.me');

//GASのプロパティを使いやすいように
//プロパティを使うことで機密情報のべた書きを避ける
const P = {
  prop: PropertiesService.getScriptProperties(),
  get(key) {
    return this.prop.getProperty(key);
  },
  set(key, value) {
    this.prop.setProperty(key, value);
  },
};

//5分おきにこの関数を実行するように時限トリガーを設定
const retainGlitch = () => {
  //あらかじめ設定しておいたプロパティを呼び出す
  const glitchURL = P.get('glitchURL');

  const data = {};
  const headers = { 'Content-Type': 'application/json; charset=UTF-8' };
  const params = {
    method: 'post',
    payload: JSON.stringify(data),
    headers: headers,
    muteHttpExceptions: true,
  };
  //特に中身のないデータをGlitchへPOST
  response = UrlFetchApp.fetch(glitchURL, params);
  console.log(response);
};

function doGet(e) {
  return HtmlService.createHtmlOutput('Hello, world!');
}

//Glitchからのメッセージが入ったPOSTを受け取る
const doPost = (e) => {
  const message = JSON.parse(e.postData.contents);

  // ユーザIDを取得
  var userId = message.author.username;
  // シートの取得
  var sheetName = userId.startsWith('leaf6328') ? 'ミナリALL' : 'タガALL';
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  // sheet.getRange(2, 5).setValue(message);

  // 一括で操作したいユーザリスト
  const userList = ['tagahei12', 'leaf6328'];
  let messageObj;

  // attendanceコマンドにて，モーダルから送られてきた内容を反映
  // 入力欄が埋まってればstart，空いてればendに分岐
  if (message.content.startsWith('attendance/')) {
    // シート名の生成
    const mainMessage = message.content.slice('attendance/'.length).trim();

    if (sheet.getRange(9, 2).getValue() === '') {
      message.content = 'end/' + mainMessage;
    } else {
      message.content = 'start/' + mainMessage;
    }
  }

  if (message.content.startsWith('start/')) {
    const restOfMessage = message.content.slice('start/'.length).trim();

    // ここで restOfMessage を使って必要な処理を実行
    startBotTimeData(restOfMessage, userId);

    // 返信データを作成
    messageObj = {
      messageType: 'send',
      content: '計測を開始したよ！😊',
    };
  } else if (message.content.startsWith('end')) {
    endTimeData(userId);

    // 返信データを作成
    messageObj = {
      messageType: 'send',
      content: '計測を終了したよ！🥰',
    };
  } else if (message.content.startsWith('startAll/')) {
    const content = message.content.slice('startAll/'.length).trim();

    // ユーザリストの人数分，勤怠の開始を実行
    for (let i = 0; i < userList.length; i++) {
      startBotTimeData(content, userList[i]);
    }

    // 返信データを作成
    messageObj = {
      messageType: 'sendAll',
      content: '全員分の計測を開始したよ！😊',
    };
  } else if (message.content.startsWith('allEnd')) {
    // ユーザリストの人数分，勤怠の計測終了を実行
    for (let i = 0; i < userList.length; i++) {
      endTimeData(userList[i]);
    }

    // 返信データを作成
    messageObj = {
      messageType: 'sendAll',
      content: '全員分の計測を終了したよ！🥰',
    };
  } else {
    //返信データを作成
    messageObj = {
      messageType: 'nothing',
      content: message.content,
    };
  }

  const payload = JSON.stringify(messageObj);

  //json形式データを返す
  const output = ContentService.createTextOutput().setMimeType(
    ContentService.MimeType.JSON
  );
  return output.setContent(payload);
};

// ログをファイルに書き出す関数
function appendLogToFile(logMessage) {
  const fileName = 'log.txt';
  const folder = DriveApp.getRootFolder();
  const file = folder.getFilesByName(fileName).next();

  // ファイルが存在する場合は開き、存在しない場合は新規作成
  const logFile = file ? file : folder.createFile(fileName, logMessage);

  // ファイルにログを追記
  logFile.setContent(logFile.getBlob().getDataAsString() + '\n' + logMessage);
}
