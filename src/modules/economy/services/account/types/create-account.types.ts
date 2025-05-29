export type CreateAccountRequest = {
  username: string;
  currency: string;
  bankId: string; // UUID
}

export type CreateAccountResponse = {
  id: string; // UUID
  username: string;
  currency: string;
  amount: number;
  bankId: string; // UUID
  createdAt: Date;
}
