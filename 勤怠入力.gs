function roundDownTo15Minutes(date) {
  var minutes = date.getMinutes();
  var roundedMinutes = Math.floor(minutes / 15) * 15;
  date.setMinutes(roundedMinutes);
  date.setSeconds(0); // 秒数を0に設定
  date.setMilliseconds(0); // ミリ秒を0に設定
  return date;
}

function roundUpTo15Minutes(date) {
  var minutes = date.getMinutes();
  var roundedMinutes = Math.ceil(minutes / 15) * 15;
  date.setMinutes(roundedMinutes);
  date.setSeconds(0); // 秒数を0に設定
  date.setMilliseconds(0); // ミリ秒を0に設定
  return date;
}

function mainButton() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var tableRangeB9 = sheet.getRange('B9'); // テーブルの最初のセル
  var tableRangeB10 = sheet.getRange('B10'); // テーブルの最初のセル

  if (tableRangeB10.getValue()) {
    if (tableRangeB9.getValue()) {
      startTimeData();
    } else {
      endTimeData();
    }
  } else {
    startTimeData();
  }
}

function startTimeData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var tableRange = sheet.getRange('A9'); // テーブルの最初のセル

  var date = new Date(); // 現在の日付と時刻を取得
  date = roundDownTo15Minutes(date); // 15分単位で切り捨て

  // テキスト入力ウィンドウを表示
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt('業務内容を入力してください', ui.ButtonSet.OK_CANCEL);

  if (result.getSelectedButton() == ui.Button.OK) {
    var description = result.getResponseText();
    
    // 新しいデータを挿入する行を選択
    var newRow = sheet.getRange('A9').getRow();
    // 既存のデータを下にシフトさせる
    sheet.insertRowsBefore(newRow, 1);
    
    // テキストを業務内容として記録
    sheet.getRange(tableRange.getRow(), 3).setValue(description);
    tableRange.setValue(date);
  } else {
    var description = 'キャンセルされました';
    Browser.msgBox(description);
  }

}


function endTimeData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var tableRange = sheet.getRange('B9'); // テーブルの最初のセル

  var date = new Date(); // 現在の日付と時刻を取得
  date = roundUpTo15Minutes(date); // 15分単位で切り上げ

  // テーブルの最初の空白セルに数値の時刻データを表示
  while (tableRange.getValue()) {
    tableRange = tableRange.offset(1, 0); // 一つ下のセルに移動
  }

  tableRange.setValue(date);
}
