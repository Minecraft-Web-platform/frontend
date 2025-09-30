export interface InitEmailConfirmationRequest {
  email: string;
}

export interface InitEmailConfirmationResponse {
  message: string;
}

export interface ConfirmEmailRequest {
  confirmationCode: string;
}

export interface ConfirmEmailResponse {
  message: string;
}
