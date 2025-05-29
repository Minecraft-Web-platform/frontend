import { Currency } from "./currency.enum";

export type CreationRequest = {
  username: string;
  currency: Currency;
  // Card gets bankId depending on government where the player is living
}

export type CreationResponse = {
  id: string; // UUID
  username: string;
  currency: Currency;
  number: string;
  issueDate: Date;
  expiredIn: Date;
  bankId: string; // UUID
}
