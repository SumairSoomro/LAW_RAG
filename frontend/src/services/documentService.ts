import { apiClient } from './api';
import { UploadResponse, DocumentListResponse } from '../types/api';

export class DocumentService {
  static async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('pdf', file);

    return apiClient.uploadFile<UploadResponse>('/upload', formData);
  }

  static async getDocuments(): Promise<DocumentListResponse> {
    return apiClient.get<DocumentListResponse>('/documents');
  }
}