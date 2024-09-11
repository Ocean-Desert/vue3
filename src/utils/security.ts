import CryptoJS from 'crypto-js'
import { JSEncrypt } from 'jsencrypt'

export interface EncryptData {
  aesKey: string
  data: string
}

export interface DecryptData {
  aesKeyByRsa: string
  data: string
}

/**
 * 使用公钥加密数据
 * @param data 数据
 * @param publicKey 公钥
 * @returns 加密数据
 */
export const encryptData = async (data: any, publicKey: string): Promise<EncryptData> => {
  // 生成AES密钥
  const aesKey = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex)
  // AES加密数据
  const encryptedData = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(JSON.stringify(data)), CryptoJS.enc.Utf8.parse(aesKey), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).toString()
  // RSA加密AES密钥
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(publicKey)
  const encryptedAesKey = encrypt.encrypt(aesKey) as string
  return { aesKey: encryptedAesKey, data: encryptedData }
}

/**
 * 解密响应数据
 * @param data 响应数据
 * @param privateKey 
 * @returns 
 */
export const decryptData = <T>(data: DecryptData, privateKey: string) => {
  const { aesKeyByRsa, data: encryptedData } = data
  // 使用私钥解密AES密钥
  const decrypt = new JSEncrypt()
  decrypt.setPrivateKey(privateKey)
  const aesKey = decrypt.decrypt(aesKeyByRsa) as string
  // 使用AES密钥解密数据
  const decryptedData = CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(aesKey), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })).toString()
  return <T> JSON.parse(decryptedData)
}

export const generateKeyPair = () => {
  const jsEncrypt = new JSEncrypt({ default_key_size: '2048' })
  const privateKey = jsEncrypt.getPrivateKeyB64()
  const publicKey = jsEncrypt.getPublicKeyB64()
  return { privateKey, publicKey }
}