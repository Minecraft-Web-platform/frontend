export interface InitPasswordResetRequest {
  username: string;
}

export interface InitPasswordResetResponse {
  message: string;
}

export interface ResetPasswordRequest {
  username: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}
