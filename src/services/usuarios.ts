import axios from 'axios'

import { Login } from '../sheets/usuarios.interface'

async function login(email: string, senha: string) {
  const data = {
    captcha_token: 'captcha',
    email,
    senha
  }
  const response = await axios.post<Login>('/login', data)
  return response.data
}

const usuariosService = {
  login
}

export default usuariosService
