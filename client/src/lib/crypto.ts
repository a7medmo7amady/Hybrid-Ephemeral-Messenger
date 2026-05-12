import CryptoJS from "crypto-js";

const SECRET_KEY =
	process.env.NEXT_PUBLIC_CRYPTO_SECRET || "ghost-secret-key-123";

export const encryptMessage = (text: string) => {
	return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptMessage = (cipherText: string) => {
	const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
	return bytes.toString(CryptoJS.enc.Utf8);
};
