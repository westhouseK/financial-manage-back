function doPost(e) {

  // TODO: LINEかNextかによって、newするオブジェクトを変更

  // LINE 
  // １つ目の要素を取得
  const [contents] = JSON.parse(e.postData.contents).events
  
  Logger.log('contentsの中身：' + JSON.stringify(contents));

  const {source, replyToken, timestamp, mode, message, type} = contents

  // ユーザ認証

  // バリデーション

  let replyText = '';
  // LINE下部のボタンが押された時、Family
  if (message.text === 'Family') {
    
    // modeをキャッシュする
    CACHE.put(source.userId, message.text, CACHE_TIME); 
    
    replyText = `2人の家計簿に入力できるよ！\nフォーマット《食費 1000 備考》\n※備考はなしでも大丈夫`;
    
  // LINE下部のボタンが押された時、Me
  } else if (message.text === 'Me') {

    replyText = "また使えないんだ。。";

  } else if (type === "message") {

    // TODO: Cacheが'Family' or 'Me'で判定する
    try {
      resister(source.userId, message.text);
      const balance = getBalance(source.userId);
      replyText = getSuccessMessage(message.text, balance);
    } catch (e) {
      replyText = e.message;
    }
  }
  
  reply(replyText, replyToken);
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
  
  // キャッシュの判定
  // ハンドリングは先にやる
  if (CACHE.get(userId) === null) throw new Error('入力する家計簿を選択してね！')
  if (CACHE.get(userId) === 'Me') throw new Error('Meはまだ使えないんだ。。')

  // 「半角スペース・全角スペース・改行コード・、・。」で区切る
  const [category, expense, remarks] = messageText.split(/[\s|\u3000|、|。|\n]/g);
  // TODO: 出費(expense)を全角でも対応できるようにする

  // カテゴリのバリエーション
  if (!Category.some(ele => ele === category)) throw new Error('想定外のカテゴリです！')
  // TODO: 出費のバリエーション

  // TODO: 備考のバリエーション

  // TODO: 共通化
  // 入力日をシステム値から取得
  const year = new Date().getFullYear();
  const month = new Date().getMonth()+1;
  const date = new Date().getDate()

  // 入力するシートの情報を取得
  const sheet_id = getFamilySheetId();
  const ss = SpreadsheetApp.openById(sheet_id);
  const sheet = ss.getSheetByName(`${year}/${month}`);

  // FIXME: 行がないと、1001行目になる
  const resisterRow = sheet.getRange(1, 4).getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow() + 1;
  
  // シートに出力する
  sheet.getRange(`D${resisterRow}`).setValue(date);
  sheet.getRange(`E${resisterRow}`).setValue(getUserName(userId));
  sheet.getRange(`F${resisterRow}`).setValue(category);
  sheet.getRange(`H${resisterRow}`).setValue(expense);
  sheet.getRange(`I${resisterRow}`).setValue(remarks ?? '');

  // TODO: ログを履く
}

// TODO: 共通化
function getBalance() {
    // 入力日をシステム値から取得
  const year = new Date().getFullYear();
  const month = new Date().getMonth()+1;
  const date = new Date().getDate()

  // 入力するシートの情報を取得
  const sheet_id = getFamilySheetId();
  const ss = SpreadsheetApp.openById(sheet_id);
  return ss.getSheetByName(`${year}/${month}`).getRange('L29').getValue();
}

function getSuccessMessage(inputMessage, balance) {
  let msg = '';
  msg += `《${inputMessage}》の登録が完了したよ！\n`;
  msg += `残り ¥${balance.toLocaleString()} だよ${getRandomEmoji()}\n`;
  if (balance >= 0) {
    msg += `${getRandomReplyMessage()}`;
  } else {
    msg += '節約しないと！'
  }
  return msg;
}

function getRandomReplyMessage() {
  return ADDITIONAL_MESSAGE[Math.floor(Math.random() * ADDITIONAL_MESSAGE.length)];
}

function getRandomEmoji() {
  return EMOJI[Math.floor(Math.random() * EMOJI.length)];
}

