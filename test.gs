function myFunction() {
  const year = new Date().getFullYear();
  const month = new Date().getMonth()+1;
  const date = new Date().getDate()

  // 入力するシートの情報を取得
  const sheet_id = getFamilySheetId();
  const ss = SpreadsheetApp.openById(sheet_id);
  const a = ss.getSheetByName(`${year}/${month}`).getRange('L29').getValue();
  console.log(`¥${a.toLocaleString()}`);
}
