require("dotenv").config();
const CryptoJS = require("crypto-js");

const SECRET_KEY = process.env.PASSWORD_SECRET_KEY;

// Decrypt AES encrypted text
const decrypt = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

module.exports = { decrypt };