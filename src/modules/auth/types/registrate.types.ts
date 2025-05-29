export type RegistrateRequest = {
  username: string;
  password: string;
  repeatPassword: string;
  email: string;
  hasMinimalAge: boolean;
  isAccepctedAgreement: boolean;
}

export type RegistrateResponse = void;
