export type RegistrateRequest = {
  username: string;
  password: string;
  repeatPassword: string;
  isAcceptedAgreement: boolean;
};

export type RegistrateResponse = void;
