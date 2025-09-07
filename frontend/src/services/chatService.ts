import { apiClient } from './api';
import { QueryResponse } from '../types/api';

export class ChatService {
  static async sendQuery(question: string): Promise<QueryResponse> {
    return apiClient.post<QueryResponse>('/query', { question });
  }
}