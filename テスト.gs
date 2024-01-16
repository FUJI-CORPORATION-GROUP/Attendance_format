function myFunction() {
  const WEBHOOK_URL = 'https://discord.com/api/webhooks/1176695188077420544/k0n60vT8KA3Qx8m1J_glADbpg9kt_vo7du8d9Ea3tiDK3AiFZ2TOgOngtI4byW0LrncA';

    const payload = {
      username: "たかし💀",
      content: "やれや",

    }

      UrlFetchApp.fetch(WEBHOOK_URL, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),

    });
}
