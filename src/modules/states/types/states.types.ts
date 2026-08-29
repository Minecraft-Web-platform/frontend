export type DiplomacyStatus = 'ally' | 'neutral' | 'war';
export type CitizenshipRequestStatus = 'pending' | 'approved' | 'rejected';
export type ElectionTargetType = 'state' | 'settlement';
export type ElectionStatus = 'nomination' | 'voting' | 'completed';

export interface IStateCitizen {
  id: number;
  username: string;
  username_lower: string;
  avatarUrl?: string | null;
  settlementId?: string | null;
  stateId?: string | null;
}

export interface IStreet {
  id: string;
  name: string;
  settlementId: string;
  createdAt: string;
}

export interface ISettlementType {
  id: string;
  name: string;
  proposedByUsername?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface ISettlement {
  id: string;
  name: string;
  description?: string;
  flagUrl?: string | null;
  color?: string | null;
  centerX?: number | null;
  centerZ?: number | null;
  status?: 'capital' | 'settlement' | 'rural';
  ruralSubTypeId?: string | null;
  ruralSubType?: ISettlementType | null;
  mayorUsername?: string | null;
  stateId?: string | null;
  createdAt: string;
  isCapital?: boolean;
  images?: string[];
  state?: IState;
  citizens?: IStateCitizen[];
  citizenshipRequests?: ICitizenshipRequest[];
}

export interface IStateDecree {
  id: string;
  stateId: string;
  title: string;
  content: string;
  authorUsername: string;
  createdAt: string;
}

export interface IDiplomacy {
  id: string;
  stateAId: string;
  stateBId: string;
  status: DiplomacyStatus;
  createdAt: string;
}

export interface IState {
  id: string;
  name: string;
  description?: string;
  flagUrl?: string | null;
  coatOfArmsUrl?: string | null;
  color?: string | null;
  nationalityMale?: string | null;
  nationalityFemale?: string | null;
  citizenshipName?: string | null;
  leaderUsername?: string | null;
  treasurerUsername?: string | null;
  voivodeUsername?: string | null;
  capitalSettlementId?: string | null;
  playerToPlayerTransferFee?: number;
  playerToCompanyTransferFee?: number;
  ipoFee?: number;
  exchangeTradingFee?: number;
  treasuryAccountNumber?: string;
  createdAt: string;
  settlements?: ISettlement[];
  citizens?: IStateCitizen[];
  isArchived: boolean;
  decrees?: IStateDecree[];
}

export interface ICitizenshipRequest {
  id: string;
  username: string;
  settlementId: string;
  status: CitizenshipRequestStatus;
  createdAt: string;
}

export interface IElectionCandidate {
  id: string;
  electionId: string;
  username: string;
  programText?: string;
  votesCount: number;
  createdAt: string;
}

export interface IElection {
  id: string;
  targetType: ElectionTargetType;
  targetId: string;
  status: ElectionStatus;
  startsAt: string;
  endsAt: string;
  winnerUsername?: string | null;
  createdAt: string;
  candidates?: IElectionCandidate[];
}

export interface ICreateStateRequest {
  name: string;
  description?: string;
  flagUrl?: string;
  coatOfArmsUrl?: string;
  color?: string;
  nationalityMale?: string;
  nationalityFemale?: string;
  citizenshipName?: string;
  leaderUsername?: string;
  capitalSettlementId?: string;
  playerToPlayerTransferFee?: number;
  playerToCompanyTransferFee?: number;
  ipoFee?: number;
  exchangeTradingFee?: number;
  treasuryAccountNumber?: string;
}

export interface ICreateSettlementRequest {
  name: string;
  description?: string;
  flagUrl?: string;
  color?: string;
  centerX?: number;
  centerZ?: number;
  status?: 'capital' | 'settlement' | 'rural';
  ruralSubTypeId?: string;
  mayorUsername?: string;
  stateId?: string;
}

export interface ISetDiplomacyRequest {
  stateBId: string;
  status: DiplomacyStatus;
}

export interface ICreateDecreeRequest {
  title: string;
  content: string;
}

export interface ICreateCitizenshipRequest {
  settlementId: string;
}

export interface IReviewCitizenshipRequest {
  status: CitizenshipRequestStatus;
}

export interface ICreateElectionRequest {
  targetType: ElectionTargetType;
  targetId: string;
  startsAt: string;
  endsAt: string;
}

export interface INominateCandidateRequest {
  programText?: string;
}

export interface IVoteRequest {
  candidateId: string;
}
