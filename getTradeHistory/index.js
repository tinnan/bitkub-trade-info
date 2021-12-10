const { API_SECRETS } = process.env;
const { default: axios } = require("axios");
const hmacSha256 = require("crypto-js/hmac-sha256");
const dayjs = require("dayjs");
const uct = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(uct);
dayjs.extend(timezone);

const bitkubBaseUrl = "https://api.bitkub.com";
const { apiKey, apiSecret } = JSON.parse(API_SECRETS);

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

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.handler = async (req, res) => {
  console.log("Request", req);
  const { sym } = req.query;
  const hist = await getTradeHistory({ sym });
  res.status(200).send(hist);
};
