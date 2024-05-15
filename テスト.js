function remindAttendance() {
  const WEBHOOK_URL =
    'https://discord.com/api/webhooks/1176695188077420544/k0n60vT8KA3Qx8m1J_glADbpg9kt_vo7du8d9Ea3tiDK3AiFZ2TOgOngtI4byW0LrncA';

  const payload = {
    username: '勤怠リマインドbot',
    content:
      '<@467325985210105876><@811400593091461151> **勤怠の提出期限が迫っとるでよ**\nhttps://docs.google.com/spreadsheets/d/1mfNqIiTHnjTFz_VwjS4govFHnURW0LHt0T5jwrhgrGI/edit#gid=0',
  };

  UrlFetchApp.fetch(WEBHOOK_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
  });
}
