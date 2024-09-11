const AUTHORIZATION = 'authorization'

const isLogin = () => {
  return !!localStorage.getItem(AUTHORIZATION)
}

const getToken = () => {
  return localStorage.getItem(AUTHORIZATION)
}

const setToken = (token: string) => {
  localStorage.setItem(AUTHORIZATION, token)
}

const clearToken = () => {
  localStorage.removeItem(AUTHORIZATION)
}

export { isLogin, getToken, setToken, clearToken }
