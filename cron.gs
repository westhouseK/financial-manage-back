function createSheet() {

  const spreadSheet = SpreadsheetApp.openById(getSheetId('Family'));
  const templateSheet = spreadSheet.getSheetByName("template");
  const year = new Date().getFullYear();
  // とりあえずトリガーのテスト
  const month = new Date().getMonth()+2;
  templateSheet.copyTo(spreadSheet).setName(`${year}/${month}`);
  
}