import { EnhancedWithAuthHttpService } from './http-auth.service';
import { httpFactoryService } from './http-factory.service';

export class UploadService {
  constructor(private readonly httpService: EnhancedWithAuthHttpService) {}

  public async uploadImage(file: File, folder: string = 'misc'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    // The HTTP service should be able to handle FormData.
    // If it sets Content-Type to JSON automatically, we need to bypass it or use fetch directly.
    // Let's use fetch directly with the auth token to avoid any issues with custom http wrapper and multipart/form-data.
    const { default: useAuthStore } = await import('../../store/auth.store');
    const token = useAuthStore.getState().accessToken;

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Ошибка при загрузке картинки');
    }

    const data = await response.json();
    return data.url;
  }
}

export const uploadService = new UploadService(httpFactoryService.createAuthHttpService());
