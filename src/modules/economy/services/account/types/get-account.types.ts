export type Account = {
  id: string; // UUID
  username: string;
  currency: string;
  amount: number;
  bankId: string; // UUID
  createdAt: Date;
}

export type GetAccountResponse = Account;

export type GetAllAccounsRequest = {
  username: string;
}

export type GetAllAccountsResponse = Account[];
