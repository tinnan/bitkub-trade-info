const { API_SECRETS } = process.env;
const { default: axios } = require("axios");
const hmacSha256 = require("crypto-js/hmac-sha256");

const bitkubBaseUrl = "https://api.bitkub.com";
const { apiKey, apiSecret } = JSON.parse(API_SECRETS);

function createTimestamp() {
  return Math.floor(Date.now() / 1000);
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
  const { result: walletData } = response.data;
  const wallets = [];
  for (const k in walletData) {
    const v = walletData[k];
    wallets.push({ sym: k, bal: v });
  }
  return wallets;
}

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.handler = async (req, res) => {
  const wallets = await getWallet();
  res.status(200).send(wallets);
};
