const { urls } = require('./urls');
const fetch = require('node-fetch');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const getKey = async () => {
  return new Promise((resolve, reject) => {
    const ssm = new AWS.SSM();
    ssm.getParameter({
      Name: 'JazComKey',
      WithDecryption: true,
    }, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    })
  })
}

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
  const key = ""; //await getKey();
  return { firstReading, key: key[0], len: key.length };
};
