/** 
 * 月初に家計簿シートをテンプレートからコピー
 *   cronで1日 0:00〜1:00に実行
 */
function createSheet() {

  // TODO: 共有のシート以外もセットする
  const spreadSheet = SpreadsheetApp.openById(getSheetId('Family'));
  const templateSheet = spreadSheet.getSheetByName(TEMPLATE_SHEET);
  const year = new Date().getFullYear();
  const month = new Date().getMonth()+1;
  templateSheet.copyTo(spreadSheet).setName(`${year}/${month}`);
  
}