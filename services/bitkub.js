const { apiKey, apiSecret } = require("../config/credential");
const { default: axios } = require("axios");
const hmacSha256 = require("crypto-js/hmac-sha256");
const dayjs = require("dayjs");

const bitkubBaseUrl = "https://api.bitkub.com";

function createTimestamp() {
  return Math.floor(Date.now() / 1000);
}

function toDate(ts) {
  return new Date(ts * 1000);
}

function buildPrivateApiBody(data) {
  const ts = createTimestamp();
  const o = { ...data, ts };
  const sig = hmacSha256(JSON.stringify(o), apiSecret).toString();
  o.sig = sig;
  return o;
}

function buildPrivateApiHeaders() {
  return {
    Accept: "application/json",
    "Content-type": "application/json",
    "X-BTK-APIKEY": apiKey,
  };
}

async function getWallet() {
  const headers = buildPrivateApiHeaders();
  const data = buildPrivateApiBody({});
  const response = await axios({
    url: `${bitkubBaseUrl}/api/market/wallet`,
    method: "post",
    headers,
    data,
  });
  return response;
}

async function getWallet() {
  const headers = buildPrivateApiHeaders();
  const data = buildPrivateApiBody({});
  const response = await axios({
    url: `${bitkubBaseUrl}/api/market/wallet`,
    method: "post",
    headers,
    data,
  });
  const { result: walletData } = response.data;
  const wallets = [];
  for (const k in walletData) {
    const v = walletData[k];
    wallets.push({ sym: k, bal: v });
  }
  return wallets;
}

async function getTradeHistory({ sym, p, lmt, start, end }) {
  const headers = buildPrivateApiHeaders();
  const data = buildPrivateApiBody({ sym, p, lmt, start, end });
  const response = await axios({
    url: `${bitkubBaseUrl}/api/market/my-order-history`,
    method: "post",
    headers,
    data,
  });
  const { error, result: hist } = response.data;
  if (error > 0) {
    return [];
  }
  const h = hist.map(({ txn_id, side, hash, rate, fee, amount, ts }) => ({
    txn_id,
    side,
    hash,
    rate,
    fee,
    amount,
    fiat: (amount * rate - fee).toFixed(2),
    ts: dayjs(toDate(ts)).format(),
  }));
  return h;
}

module.exports = { getWallet, getTradeHistory };
