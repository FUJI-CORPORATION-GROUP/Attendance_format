const setURL = () => P.set('glitchURL', 'https://nonchalant-superficial-krill.glitch.me');

//GASのプロパティを使いやすいように
//プロパティを使うことで機密情報のべた書きを避ける
const P = {
  prop: PropertiesService.getScriptProperties(),
  get(key) {
    return this.prop.getProperty(key);
  },
  set(key, value) {
    this.prop.setProperty(key, value);
  }
}


//5分おきにこの関数を実行するように時限トリガーを設定
const retainGlitch = () => {
  //あらかじめ設定しておいたプロパティを呼び出す
  const glitchURL = P.get('glitchURL')

  const data = {}
  const headers = { 'Content-Type': 'application/json; charset=UTF-8' }
  const params = {
    method: 'post',
    payload: JSON.stringify(data),
    headers: headers,
    muteHttpExceptions: true
  }
  //特に中身のないデータをGlitchへPOST
  response = UrlFetchApp.fetch(glitchURL, params);
  console.log(response);
}

function doGet(e) {
  return HtmlService.createHtmlOutput('Hello, world!');
}

//Glitchからのメッセージが入ったPOSTを受け取る
const doPost = e => {
  const message = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  let messageObj

  if (message.content.startsWith("勤務開始：")) {
    const restOfMessage = message.content.slice("勤務開始：".length).trim(); // メッセージから「勤務開始」を取り除いてトリム

    // ここで restOfMessage を使って必要な処理を実行
    startBotTimeData(restOfMessage, message.author.username);

    // 返信データを作成
    messageObj = {
      'messageType': 'send',
      'content': '計測を開始したよ！😊'
    };
  }
  else if (message.content.startsWith("勤務終了")) {
    endTimeData(message.author.username);

    // 返信データを作成
    messageObj = {
      'messageType': 'send',
      'content': '計測を終了したよ！🥰'
    };
  }
  else {
    //返信データを作成
    messageObj = {
      'messageType': 'nothing',
      'content': message.content
    }
  }


  const payload = JSON.stringify(messageObj);

  //json形式データを返す
  const output = ContentService.createTextOutput().setMimeType(ContentService.MimeType.JSON);
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
