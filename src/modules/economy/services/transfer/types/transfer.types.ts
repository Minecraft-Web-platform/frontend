export type TransferRequest = {
  fromCardId: string;
  toCardNumber: string;
  amount: number;
}

export type TransferResponse = {
  senderUsername: string;
  receiverUsername: string;
  transferedAt: Date;
  fees: {
    ofSenderBank: number;
    ofReceiverBank: number;
  };
  amount: {
    inReceiverCurrency: number;
    inSenderCurrency: number;
  };
  
}