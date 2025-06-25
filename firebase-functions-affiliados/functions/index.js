
const functions = require("firebase-functions");

const affiliateLinks = {
  trip: "https://tp.media/r?marker=639764&trs=425649&p=8626&u=https%3A%2F%2Ftrip.com&campaign_id=121",
  localrent: "https://tp.media/r?marker=639764&trs=425649&p=2043&u=https%3A%2F%2Flocalrent.com%2Fen&campaign_id=87",
  tiqets: "https://tp.media/r?marker=639764&trs=425649&p=2074&u=https%3A%2F%2Ftiqets.com&campaign_id=89",
  kiwi: "https://tp.media/click?shmarker=639764&promo_id=3413&source_type=link&type=click&campaign_id=111&trs=425649",
  ekta: "https://tp.media/r?marker=639764&trs=425649&p=5869&u=https%3A%2F%2Fektatraveling.com&campaign_id=225",
  hotellook: "https://tp.media/r?marker=639764&trs=425649&p=4115&u=https%3A%2F%2Fhotellook.com&campaign_id=101"
};

exports.redirect = functions.https.onRequest((req, res) => {
  const key = req.query.key;
  const url = affiliateLinks[key];
  if (!url) {
    return res.status(404).send("Link não encontrado.");
  }
  return res.redirect(302, url);
});
