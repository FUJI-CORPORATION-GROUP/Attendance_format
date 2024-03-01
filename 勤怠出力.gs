const parsonalContents = [
  {allSheetName: "タガALL", excelFileName: "田賀康平"},
  {allSheetName: "ミナリALL", excelFileName: "實成翔"},
]

function makeSheet(start,end,allSheetName){
  start = new Date(start)
  end = new Date(end)
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(allSheetName);
  var tableRange = sheet.getDataRange(); // テーブルの最初のセル

  var cells = tableRange.getValues();
  Logger.log(typeof(cells))
  var attendances = [];
  for(cell of cells){
    var thedate = cell[0];
    if(typeof(thedate) == "object"){
      // 期間内かどうかの判定
      if(start <= thedate  && thedate <= end){
        var attendance = {}
        attendance.startDate = cell[0]
        attendance.endDate = cell[1]
        attendance.workContent = cell[2]
        attendances.push(attendance);
      }
    }
  }
  
  // 勤怠表を修正する
  var modifiedAttendances  = [];
  for(attendance of attendances){
    var theStartDate = attendance.startDate
    var theEndDate = attendance.endDate
    // 日数の計算
    var diffDay = Math.abs(new Date(theEndDate).setHours(0,0,0,0) - new Date(theStartDate).setHours(0,0,0,0)) / 1000 / 60 / 60 / 24;

    // 日をまたいでいた時の処理
    if(diffDay >= 1){
      for(var i = 0;i <= diffDay;i++){
        var theDate = new Date(theStartDate).setDate(theStartDate.getDate()+  i)
        var theModifiedAttendance = Object.assign({},attendance);
        if(i == 0){
          // startDate = startDate
          theModifiedAttendance.startDate = new Date(attendance.startDate);
          // endDate = 23:45
          theModifiedAttendance.endDate = new Date(theDate).setHours(23, 45, 0, 0)
        }else if(i == diffDay){
          // startDate = 0:00
          theModifiedAttendance.startDate = new Date(theDate).setHours(0, 0, 0, 0)
          // endDate = endDate
          theModifiedAttendance.endDate = new Date(attendance.endDate).setMinutes(attendance.endDate.getMinutes() + 15*diffDay);
        }else{
          // startDate = 0:00
          theModifiedAttendance.startDate = new Date(theDate).setHours(0, 0, 0, 0)
          // endDate = 23:45
          theModifiedAttendance.endDate = new Date(theDate).setHours(23, 45, 0, 0)
        }
        modifiedAttendances.push(theModifiedAttendance)
      }
      
    }else{

      modifiedAttendances.push(attendance)
    }
  }

  // 日付によるソート
  modifiedAttendances = modifiedAttendances.sort(function(a,b){
    return (a.startDate > b.startDate) ? -1 : 1;
  })

  makeDetailSheet(modifiedAttendances);
  makeSumSheet(start,end,modifiedAttendances)

}

function makeDetailSheet(attendances){
  Logger.log("makeDetailSheet");

  var sheetName = "明細";
  clearSheet(sheetName)
  var detailSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var tableRange = detailSheet.getRange('A3'); // テーブルの最初のセル

  console.log(attendances)
  attendances.reverse();
  console.log(attendances)
  
  var allWorkTime = 0;
  for(attendance of attendances){
    var startDate = new Date(attendance.startDate);
    var endDate = new Date(attendance.endDate);

    //月
    var month = startDate.getMonth() + 1;
    var monthRange = tableRange;
    monthRange.setValue(month)

    //日付
    var day = startDate.getDate();
    var dayRange = tableRange.offset(0, 1);
    dayRange.setValue(day);

    //曜日
    var dateJa = ["日","月","火","水","木","金","土"];
    var date = dateJa[startDate.getDay()];
    var dateRange = tableRange.offset(0, 2);
    dateRange.setValue(date);

    // 開始時間
    var startHour = startDate.getHours();
    var startHourRange = tableRange.offset(0, 3);
    startHourRange.setValue(startHour);

    var startMinutes = startDate.getMinutes();
    var startMinutesRange = tableRange.offset(0, 4);
    startMinutesRange.setValue(startMinutes);
    
    // 終了時間
    var endHour = endDate.getHours();
    var endHourRange = tableRange.offset(0, 5);
    endHourRange.setValue(endHour);

    var endMinutes = endDate.getMinutes();
    var endMinutesRange = tableRange.offset(0, 6);
    endMinutesRange.setValue(endMinutes);

    // 勤務時間
    var workTime = (endDate - startDate) / 1000 / 60;
    var workTimeRange = tableRange.offset(0, 7);
    workTimeRange.setValue(workTime);
    allWorkTime += workTime;

    // 業務内容
    var task = attendance.workContent;
    var taskRange = tableRange.offset(0, 8);
    taskRange.setValue(task);

    tableRange = tableRange.offset(1, 0); // 一つ下のセルに移動
  }

  //合計の出力
  allWorkTimeLabelRange = tableRange.offset(0, 6);
  allWorkTimeLabelRange.setValue("合計");
  allWorkTimeRange = tableRange.offset(0, 7);
  allWorkTimeRange.setValue(allWorkTime);

}


function makeSumSheet(start,end, attendances){
  var sheetName = "合計";
  clearSheet(sheetName)
  var sumSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var tableRange = sumSheet.getRange('A3'); // テーブルの最初のセル

  //　start ~ end の日付・土曜日
  var tmpTime = new Date(start);
  var allWorkTime = 0;

  while(tmpTime <= end){
    //月
    var month = tmpTime.getMonth() + 1;
    var monthRange = tableRange;
    monthRange.setValue(month)

    //日付
    var day = tmpTime.getDate();
    var dayRange = tableRange.offset(0, 1);
    dayRange.setValue(day);

    //曜日
    var dateJa = ["日","月","火","水","木","金","土"];
    var date = dateJa[tmpTime.getDay()];
    var dateRange = tableRange.offset(0, 2);
    dateRange.setValue(date);

    //tmpTimeが同じ日時
    var workTime = 0;
    for(attendance of attendances){
      var startDate = new Date(attendance.startDate);
      var endDate = new Date(attendance.endDate);
      if(tmpTime.getFullYear() == startDate.getFullYear()&&tmpTime.getMonth() == startDate.getMonth()&&tmpTime.getDate() == startDate.getDate()){
        // 勤務時間
        workTime += (endDate - startDate) / 1000 / 60;
      }
    }
    var workTimeRange = tableRange.offset(0, 5);
    workTimeRange.setValue(workTime);
    allWorkTime += workTime

    var workTimeHour = Math.floor(workTime / 60);
    var workTimeHourRange = tableRange.offset(0, 3);
    workTimeHourRange.setValue(workTimeHour);

    var workTimeMinutes = workTime % 60;
    var workTimeMinutesRange = tableRange.offset(0, 4);
    workTimeMinutesRange.setValue(workTimeMinutes);


    tmpTime.setDate(tmpTime.getDate()+1)
    tableRange = tableRange.offset(1, 0); // 一つ下のセルに移動
  }


  // 合計の表示
  allWorkTimeLabelRange = tableRange.offset(0, 2);
  allWorkTimeLabelRange.setValue("合計");

  var allWorkTimeRange = tableRange.offset(0, 5);
  allWorkTimeRange.setValue(allWorkTime);

  var allWorkTimeHour = Math.floor(allWorkTime / 60);
  var allWorkTimeHourRange = tableRange.offset(0, 3);
  allWorkTimeHourRange.setValue(allWorkTimeHour);

  var allWorkTimeMinutes = allWorkTime % 60;
  var allWorkTimeMinutesRange = tableRange.offset(0, 4);
  allWorkTimeMinutesRange.setValue(allWorkTimeMinutes);

}

function clearSheet(sheetName){
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  for(var i = 2;i<lastColumn;i++){
    sheet.getRange(3, 1, lastRow - 1,lastColumn).clearContent();
  }
}


function showDatePickerDialog() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile('datePicker')
      .setWidth(300)
      .setHeight(250);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '期間を選択');

}


// ParsonalContentsに登録している人の勤怠表を出力する
function exportParsonalsAttendanceRecordFile(start, end){
  var excelDataArr = [];
  for(parsonalContent of parsonalContents){
    console.log(parsonalContents)
    var data = exportAttendanceRecordFile(start, end, parsonalContent.allSheetName, parsonalContent.excelFileName)
    excelDataArr.push(data)
  }

  return excelDataArr
}


// 勤怠表生成メイン関数
function exportAttendanceRecordFile(start, end, allSheetName,excelFileName){
  var folderName = "出力勤怠表";

  //TODO: ファイル名の決定
  var fileName = excelFileName + "_" + start

  // 合計・明細シート作成
  // TODO：UserIDに応じて2つ作る
  makeSheet(start,end,allSheetName)

  // 合計・明細シートをExcelに出力
  // TODO: UserIDに応じてそれぞれ作成
  exportSheetToExcel(folderName, fileName)

  // ダウンロードするために，データ取得
  var data = downloadExcelFile(fileName)
  return data
}

function exportSheetToExcel(folderName, fileName){
  Logger.log("exportSheetToExcel")
  // TODO: UserIDに応じてそれぞれ作成
  exportNewSheet(folderName,fileName)
  // スプシからExcelファイルに変換
  changeExcel(folderName,fileName)
}

function exportNewSheet(folderName, fileName){
  // Debug用
  // var folderName = "出力勤怠表";
  // var newFileName = "test"

  // 生成先のファイル
  const folder = DriveApp.getFoldersByName(folderName);
  const folderId = folder.next().getId()

  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var detailSheet = spreadSheet.getSheetByName('明細');
  var sumSheet = spreadSheet.getSheetByName("合計")
  
  var newSheetFile = Drive.Files.create({
    "name":   fileName,
    "mimeType": "application/vnd.google-apps.spreadsheet",
    "parents":  [folderId]
  });

  var newSheet  = SpreadsheetApp.openById(newSheetFile.id);
  Logger.log(newSheetFile.id)
  Logger.log(newSheet.getId())


  // 新しいシートにコピー
  detailSheet.copyTo(newSheet);
  sumSheet.copyTo(newSheet);

  // シート名変更
  let exportDetailSheet  = newSheet.getSheetByName('明細 のコピー');
  let exportSumSheet  = newSheet.getSheetByName('合計 のコピー');
  exportDetailSheet.setName('明細');
  exportSumSheet.setName('合計');

  // 無駄なシート削除
  let deleteSheet  = newSheet.getSheets();
  newSheet.deleteSheet(deleteSheet[0]);
}

function changeExcel(folderName, fileName){
  // Debug用
  // var folderName = "出力勤怠表";
  // var newFileName = "test"

  var folder = DriveApp.getFoldersByName(folderName).next();
  var file = DriveApp.getFilesByName(fileName).next();
  var fileId = file.getId();

  var url = "https://docs.google.com/spreadsheets/d/" + fileId + "/export?format=xlsx";

  //urlfetchする際のoptionsを宣言
  var options = {
    method:"get",
    headers:{"Authorization":"Bearer " + ScriptApp.getOAuthToken()}, 
  }

  //urlfetch
  var response = UrlFetchApp.fetch(url,options);
  
  //urlfetchのレスポンスをblobクラスとして取得
  var blob = response.getBlob();

  //取得したblobクラスから新規ファイルを生成
  var newFile = DriveApp.createFile(blob);
  
  //作成したファイルの名前を変更
  newFile.setName(fileName);
  
  //作成したファイルを格納フォルダに移動
  newFile.moveTo(folder);

  var getUrl = newFile.getDownloadUrl();
}

function showDownloadDialog() {
  var htmlOutput = HtmlService.createHtmlOutputFromFile('Download')
      .setWidth(300)
      .setHeight(250);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Excel出力');
}

function downloadExcelFile(fileName) {
  var file = DriveApp.getFilesByName(fileName).next();
  var blob = file.getBlob();
  var data = Utilities.base64Encode(blob.getBytes());
  var contentType = blob.getContentType();
  var fileName = file.getName();
  
  return {
    fileName: fileName,
    contentType: contentType,
    base64Data: data
  };
}
