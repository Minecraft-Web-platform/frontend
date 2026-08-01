export type DiplomacyStatus = 'ally' | 'neutral' | 'war';
export type CitizenshipRequestStatus = 'pending' | 'approved' | 'rejected';
export type ElectionTargetType = 'state' | 'city';
export type ElectionStatus = 'nomination' | 'voting' | 'completed';

export interface IStateCitizen {
  id: number;
  username: string;
  username_lower: string;
  avatarUrl?: string | null;
  cityId?: string | null;
  stateId?: string | null;
}

export interface ICity {
  id: string;
  name: string;
  description?: string;
  flagUrl?: string | null;
  mayorUsername?: string | null;
  stateId?: string | null;
  createdAt: string;
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
  leaderUsername?: string | null;
  capitalCityId?: string | null;
  createdAt: string;
  cities?: ICity[];
  citizens?: IStateCitizen[];
  decrees?: IStateDecree[];
}

export interface ICitizenshipRequest {
  id: string;
  username: string;
  cityId: string;
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
  leaderUsername?: string;
  capitalCityId?: string;
}

export interface ICreateCityRequest {
  name: string;
  description?: string;
  flagUrl?: string;
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
  cityId: string;
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
