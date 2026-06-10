import Cookies from 'js-cookie'
import { JSEncrypt } from 'jsencrypt'

const TokenKey = 'Admin-Token'
const wdsToken = 'wds-redisToken'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getWdsToken() {
  return Cookies.get(wdsToken)
}

export function setWdsToken(token) {
  return Cookies.set(wdsToken, token)
}

export function removeWdsToken() {
  return Cookies.remove(wdsToken)
}

export function getCookie(key) {
  return Cookies.get(key)
}

export function setCookie(key, value, options = {}) {
  return Cookies.set(key, value, options)
}

export function removeCookie(key) {
  return Cookies.remove(key)
}

// 使用与wts-vue2相同的公钥
const publicKey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKhnwGGXEV/71JQ7fBW8k2aQzs3xuSWN\n' +
  'ZHZaRkxgEQBCqtD11JYV8jZdxv1V7wpFGIcHXM80Khu8Eca8IlW+DTkCAwEAAQ=='

const privateKey = 'MIIBVgIBADANBgkqhkiG9w0BAQEFAASCAUAwggE8AgEAAkEAqGfAYZcRX/vUlDt8\n' +
  'FbyTZpDOzfG5JY1kdlpGTGARAEKq0PXUlhXyNl3G/VXvCkUYhwdczzQqG7wRxrwi\n' +
  'Vb4NOQIDAQABAkEAk5qscl0Yq4ps3qfssJiikYlm2fd+kj2Fyn6Bkzu4awKX4Z4I\n' +
  'sSTskiL5AhOLz6BzzNWoVnAFoscxe+QE1NCFaQIhANTkp66Xc48PT/phuLar/Na9\n' +
  'LDuNYxN72fslR+bjXc1PAiEAyoEPc1txFHqMFA1xpLRm2aFiBy9mcujhNG6bC+0S\n' +
  'KvcCIQCD4i56evoseqjqDBWYnEziXoiDT+A7lrL/4SV8xAc9AwIhAK9GmC375tuX\n' +
  '2qj8nfG2qBMU6XlYoK8zPMIaPh9Lel8vAiAUnJOdZrweVeAMts8Lrx+QB/oo+3Wv\n' +
  'g/mkYenJ/Y22yg=='

// 加密
export function encrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey)
  return encryptor.encrypt(txt)
}

// 解密
export function decrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKey)
  return encryptor.decrypt(txt)
}
