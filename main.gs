function doPost(e) {

  // TODO: LINEかNuxtかによって、newするオブジェクトを変更

  // LINE 
  // １つ目の要素を取得
  const [contents] = JSON.parse(e.postData.contents).events
  
  Logger.log('contentsの中身：' + JSON.stringify(contents));

  const {source, replyToken, timestamp, mode, message, type} = contents

  // ユーザ認証

  // バリデーション

  const cache = CacheService.getScriptCache();
  let replyText = '';
  if (message.text === 'Family') {
    
    // キャッシュに入れる 10分くらい??
    cache.put(source.userId, message.text, 60 * 10);
    
    Logger.log('Familyをcache');

    replyText = '2人の家計簿に入力できるよ！';

  } else if (message.text === 'Me') {

    // キャッシュに入れる 10分くらい??
    cache.put(source.userId, message.text, 60 * 10);

    Logger.log('Meをcacheに入れる');

    replyText = `${getUser(userId).name}の家計簿に入力できるよ！`;

  } else if (type === "message") {

    resister(source.userId, message.text);

    replyText = message.text;
  }

  if(type === "message") {
    reply(replyText, replyToken);
  }
}

/*
 * ユーザに返信する
 */
function reply(messageText, replyToken) {

  // 受信したメッセージをそのまま送信
  const message = {
    "replyToken": replyToken,
    "messages": [
      {
        "type": "text",
        "text": messageText
      }
    ]
  };
  Logger.log(message);
  // 送信のための諸準備
  const replyData = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + getChannelAccessToken()
    },
    "payload": JSON.stringify(message)
  };
  Logger.log(replyData);
  // JSON形式でAPIにポスト
  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", replyData);
}

function resister(userId, messageText) {

  // cacheの判定

  // 値のバリデーション

  // スペースとかで区切る？？
  const [expenxseDate, category, expense] = messageText.split(/[\s、。\n]/g);
  // TODO: 年をまたいだ時バグるので検討する
  const year = new Date().getFullYear();
  // TODO: 月をまだいだ時どうしよう
  const month = new Date().getMonth()+1;

  // 入力するシートを取得
  const sheet_id = getSheetId('both');
  const ss = SpreadsheetApp.openById(sheet_id);
  const sheet = ss.getSheetByName(`${year}/${month}`);


  const resisterRow = sheet.getRange(1, 4).getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow() + 1;
  
  // シートに出力する
  sheet.getRange(`D${resisterRow}`).setValue(expenxseDate);
  sheet.getRange(`E${resisterRow}`).setValue(getUser(userId).name);
  sheet.getRange(`F${resisterRow}`).setValue(category);
  sheet.getRange(`H${resisterRow}`).setValue(expense);

  // ログを履く

  // クライアントに返却する
}

function test() {
  
}