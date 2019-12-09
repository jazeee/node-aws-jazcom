const { urls } = require('./urls');
const fetch = require('node-fetch');

exports.handler = async (event) => {
  let authKey = null;
  const { auth: authReq, data: dataReq } = urls;
  if (!authKey) {
    const postResult = await fetch(authReq.url, {
      method: authReq.method || "POST",
      mode: 'cors',
      headers: authReq.headers,
      body: authReq.method !== "GET" ? JSON.stringify({
        ...authReq.bodyBase,
        accountName: 'jazeee',
        password: process.env.jazComKey,
      }): undefined,
    });
    const { status } = postResult;
    if (status !== 200) {
      throw new Error("Unable to Post Username");
    }
    authKey = await postResult.json();
  }

  const postResult = await fetch(`${dataReq.url}?sessionId=${authKey}&minutes=1440&maxCount=1`, {
    method: dataReq.method || "POST",
    mode: 'cors',
    headers: dataReq.headers,
    body: dataReq.method !== "GET" ? '' : undefined,
  });
  const { status } = postResult;
  if (status !== 200) {
    throw new Error(await postResult.text());
  }
  const readings = await postResult.json();
  const [firstReading] = readings;
  return firstReading;
};

