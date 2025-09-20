require("dotenv").config();

const CryptoJS = require("crypto-js");

const SECRET_KEY = process.env.PASSWORD_SECRET_KEY;

// Decrypt AES encrypted text
const decrypt = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { decrypt };
