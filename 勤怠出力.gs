

function makeSheet(start,end){
  start = new Date(start)
  end = new Date(end)
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var tableRange = sheet.getDataRange(); // テーブルの最初のセル

  var cells = tableRange.getValues();
  Logger.log(typeof(cells))
  var data = [];
  for(cell of cells){
    var thedate = cell[0];
    if(typeof(thedate) == "object"){
      if(start <= thedate  && thedate <= end){
        data.push(cell);
      }
    }
  }

  Logger.log(data);
  makeDetailSheet(data);
  makeSumSheet(start,end,data)
}

function makeDetailSheet(data){
  Logger.log("makeDetailSheet");

  var sheetName = "明細";
  clearSheet(sheetName)
  var detailSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var tableRange = detailSheet.getRange('A3'); // テーブルの最初のセル

  console.log(data)
  data.reverse();
  console.log(data)
  
  var allWorkTime = 0;
  for(d of data){
    var startDate = new Date(d[0]);
    var endDate = new Date(d[1]);

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
    var task = d[2];
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


function makeSumSheet(start,end, data){
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
    for(d of data){
      var startDate = new Date(d[0]);
      var endDate = new Date(d[1]);
      if(tmpTime.getFullYear() == startDate.getFullYear()&&tmpTime.getMonth() == startDate.getMonth()&&tmpTime.getDate() == startDate.getDate()){
        // 勤務時間
        var workTime = (endDate - startDate) / 1000 / 60;
        workTime += workTime;
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




