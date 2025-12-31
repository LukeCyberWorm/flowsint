import axios from 'axios';

// Configuração da API OwnData
const API_URL = import.meta.env.VITE_OWNDATA_API_URL || 'https://completa.workbuscas.com/api';
const API_TOKEN = import.meta.env.VITE_OWNDATA_TOKEN || 'HhsbkqwwpEJIhEZPQGAPOjmC';

// Mapeamento de módulos
// CPF -> cpf, Telefone -> phone, Nome -> name, Email -> mail
// Título -> title, CEP -> cep, Mãe -> mother, CNPJ -> cnpj
type OwnDataModule = 'cpf' | 'phone' | 'name' | 'mail' | 'title' | 'cep' | 'mother' | 'cnpj';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 segundos
});

/**
 * Interface para resposta da API OwnData
 */
export interface OwnDataResponse {
  success: boolean;
  data: any;
  message?: string;
  error?: string;
}

/**
 * Realiza uma consulta na API OwnData
 * @param module Módulo de consulta (cpf, phone, name, mail, title, cep, mother, cnpj)
 * @param query Parâmetro de busca
 */
const search = async (module: OwnDataModule, query: string): Promise<OwnDataResponse> => {
  try {
    const response = await api.get('', {
      params: {
        token: API_TOKEN,
        modulo: module,
        consulta: query.replace(/[^\w]/g, ''), // Remove caracteres especiais
      },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error(`Erro ao buscar ${module}:`, error);
    return {
      success: false,
      data: null,
      error: error.response?.data?.message || error.message || 'Erro ao realizar consulta',
    };
  }
};

export const ownDataApi = {
  /**
   * Busca por CPF
   * @param cpf CPF para busca (pode conter pontos e traços)
   */
  searchCpf: (cpf: string) => search('cpf', cpf),

  /**
   * Busca por Telefone
   * @param phone Telefone para busca (pode conter parênteses, espaços e traços)
   */
  searchPhone: (phone: string) => search('phone', phone),

  /**
   * Busca por Nome
   * @param name Nome completo ou parcial
   */
  searchName: (name: string) => search('name', name),

  /**
   * Busca por Email
   * @param email Email para busca
   */
  searchEmail: (email: string) => search('mail', email),

  /**
   * Busca por Título de Eleitor
   * @param title Número do título de eleitor
   */
  searchTitle: (title: string) => search('title', title),

  /**
   * Busca por CEP
   * @param cep CEP para busca (pode conter traços)
   */
  searchCep: (cep: string) => search('cep', cep),

  /**
   * Busca por nome da mãe
   * @param mother Nome da mãe
   */
  searchMother: (mother: string) => search('mother', mother),

  /**
   * Busca por CNPJ
   * @param cnpj CNPJ para busca (pode conter pontos, traços e barras)
   */
  searchCnpj: (cnpj: string) => search('cnpj', cnpj),

  /**
   * Informações sobre o token e limites
   */
  getTokenInfo: () => ({
    nome: 'LukeCyberWorm',
    valorMensal: 'R$ 450,00',
    limite: 15000,
    dataExpiracao: '26/01/2026',
    modulos: ['tel', 'cpf', 'nome', 'email', 'titulo', 'cep', 'mae', 'cnpj'],
    status: 'Ativo',
  }),
};
