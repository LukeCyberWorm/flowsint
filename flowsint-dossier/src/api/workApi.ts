import axios from 'axios';

const API_URL = 'https://api.workconsultoria.com/api/v1';

// Headers fixos conforme documentação (válidos até 2026)
const AUTH_HEADERS = {
  'access-token': 'AH_0gMrfF3Us-D__pLdfAA',
  'client': 'tr2TUHr37D3qGNFTOZDYqg',
  'expiry': '1766520379',
  'token-type': 'Bearer',
  'uid': 'lukecyberworm',
  'Content-Type': 'application/json',
};

const api = axios.create({
  baseURL: API_URL,
  headers: AUTH_HEADERS,
});

// Interceptor para atualizar headers se a API retornar novos tokens
api.interceptors.response.use((response) => {
  const { 'access-token': accessToken, client, expiry, uid } = response.headers;
  
  if (accessToken) {
    api.defaults.headers.common['access-token'] = accessToken;
    localStorage.setItem('work_access_token', accessToken);
  }
  if (client) {
    api.defaults.headers.common['client'] = client;
    localStorage.setItem('work_client', client);
  }
  if (expiry) {
    api.defaults.headers.common['expiry'] = expiry;
    localStorage.setItem('work_expiry', expiry);
  }
  if (uid) {
    api.defaults.headers.common['uid'] = uid;
    localStorage.setItem('work_uid', uid);
  }
  
  return response;
}, (error) => {
  return Promise.reject(error);
});

export const workApi = {
  getProfile: () => api.get('/users/me'),
  
  searchCpf: (cpf: string) => api.get(`/consults/gate_1/cpf/?cpf=${cpf}`),
  searchCnpj: (cnpj: string) => api.get(`/consults/gate_1/cnpj/?cnpj=${cnpj}`),
  searchPlaca: (placa: string) => api.get(`/consults/gate_1/placa/?placa=${placa}`),
  searchTelefone: (phone: string) => api.get(`/consults/gate_1/phone/?phone=${phone}`),
  searchEmail: (email: string) => api.get(`/consults/gate_1/email/?email=${email}`),
  searchNome: (nome: string) => api.get(`/consults/gate_1/nome/?nome=${nome}`),
  
  // Adicione outros módulos conforme necessário
};
