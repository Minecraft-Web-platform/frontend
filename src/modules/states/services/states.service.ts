import { EnhancedWithAuthHttpService } from '../../../shared/services/http-auth.service';
import { httpFactoryService } from '../../../shared/services/http-factory.service';
import {
  ICitizenshipRequest,
  ISettlement,
  ISettlementType,
  ICreateCitizenshipRequest,
  ICreateSettlementRequest,
  ICreateDecreeRequest,
  ICreateElectionRequest,
  ICreateStateRequest,
  IDiplomacy,
  IElection,
  IElectionCandidate,
  INominateCandidateRequest,
  IReviewCitizenshipRequest,
  ISetDiplomacyRequest,
  IState,
  IStateDecree,
  IStreet,
  IVoteRequest,
} from '../types/states.types';

export class StatesService {
  constructor(private readonly httpService: EnhancedWithAuthHttpService) {}

  // --- States ---
  public async getStates(): Promise<IState[]> {
    return this.httpService.get('states');
  }

  public async getStateById(id: string): Promise<IState> {
    return this.httpService.get(`states/${id}`);
  }

  public async createState(data: ICreateStateRequest): Promise<IState> {
    return this.httpService.post('states', data);
  }

  public async updateState(id: string, data: Partial<ICreateStateRequest>): Promise<IState> {
    return this.httpService.put(`states/${id}`, data);
  }

  public async deleteState(id: string): Promise<void> {
    return this.httpService.delete(`states/${id}`);
  }

  public async resignPresident(id: string): Promise<void> {
    return this.httpService.post(`states/${id}/resign`, {});
  }

  public async assignRoles(stateId: string, data: { treasurerUsername?: string; voivodeUsername?: string }): Promise<IState> {
    return this.httpService.post(`states/${stateId}/roles`, data);
  }

  // --- Decrees ---
  public async getDecrees(stateId: string): Promise<IStateDecree[]> {
    return this.httpService.get(`states/${stateId}/decrees`);
  }

  public async createDecree(stateId: string, data: ICreateDecreeRequest): Promise<IStateDecree> {
    return this.httpService.post(`states/${stateId}/decrees`, data);
  }

  // --- Diplomacy ---
  public async getDiplomacy(stateId: string): Promise<IDiplomacy[]> {
    return this.httpService.get(`states/${stateId}/diplomacy`);
  }

  public async setDiplomacy(stateId: string, data: ISetDiplomacyRequest): Promise<IDiplomacy> {
    return this.httpService.put(`states/${stateId}/diplomacy`, data);
  }

  // --- Settlements ---
  public async getSettlements(stateId?: string): Promise<ISettlement[]> {
    const url = stateId ? `settlements?stateId=${stateId}` : 'settlements';
    return this.httpService.get(url);
  }

  public async getSettlementById(id: string): Promise<ISettlement> {
    return this.httpService.get(`settlements/${id}`);
  }

  public async createSettlement(data: ICreateSettlementRequest): Promise<ISettlement> {
    return this.httpService.post('settlements', data);
  }

  public async updateSettlement(id: string, data: Partial<ICreateSettlementRequest>): Promise<ISettlement> {
    return this.httpService.put(`settlements/${id}`, data);
  }

  public async deleteSettlement(id: string): Promise<void> {
    return this.httpService.delete(`settlements/${id}`);
  }

  public async resignMayor(id: string): Promise<void> {
    return this.httpService.post(`settlements/${id}/resign`, {});
  }

  public async setCapital(settlementId: string): Promise<ISettlement> {
    return this.httpService.post(`settlements/${settlementId}/capital`, {});
  }

  public async addSettlementImage(settlementId: string, imageUrl: string): Promise<ISettlement> {
    return this.httpService.post(`settlements/${settlementId}/images`, { imageUrl });
  }

  public async removeSettlementImage(settlementId: string, imageUrl: string): Promise<ISettlement> {
    // Axios DELETE with body requires passing data in config.
    // EnhancedWithAuthHttpService might just use standard Axios config.
    // If it's a simple wrapper, we can pass it as data.
    return this.httpService.delete(`settlements/${settlementId}/images`, { data: { imageUrl } });
  }

  // --- Settlement Types ---
  public async getSettlementTypes(all = false): Promise<ISettlementType[]> {
    return this.httpService.get(`settlements/types${all ? '?all=true' : ''}`);
  }

  public async proposeSettlementType(name: string): Promise<ISettlementType> {
    return this.httpService.post('settlements/types', { name });
  }

  public async moderateSettlementType(id: string, isApproved: boolean): Promise<ISettlementType> {
    return this.httpService.put(`settlements/types/${id}/moderate`, { isApproved });
  }

  // --- Citizenship Requests ---
  public async getRequests(settlementId: string): Promise<ICitizenshipRequest[]> {
    return this.httpService.get(`settlements/${settlementId}/requests`);
  }

  public async createRequest(settlementId: string, data: ICreateCitizenshipRequest): Promise<ICitizenshipRequest> {
    return this.httpService.post(`settlements/${settlementId}/requests`, data);
  }

  public async reviewRequest(
    settlementId: string,
    requestId: string,
    data: IReviewCitizenshipRequest,
  ): Promise<ICitizenshipRequest> {
    return this.httpService.put(`settlements/${settlementId}/requests/${requestId}`, data);
  }

  public async leaveSettlement(settlementId: string): Promise<{ success: boolean; message: string }> {
    return this.httpService.post(`settlements/${settlementId}/leave`, {});
  }

  // --- Elections ---
  public async getElections(targetType?: string, targetId?: string): Promise<IElection[]> {
    const params = new URLSearchParams();
    if (targetType) params.append('targetType', targetType);
    if (targetId) params.append('targetId', targetId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.httpService.get(`elections${query}`);
  }

  public async getElectionById(id: string): Promise<IElection> {
    return this.httpService.get(`elections/${id}`);
  }

  public async createElection(data: ICreateElectionRequest): Promise<IElection> {
    return this.httpService.post('elections', data);
  }

  public async nominateCandidate(
    electionId: string,
    data: INominateCandidateRequest,
  ): Promise<IElectionCandidate> {
    return this.httpService.post(`elections/${electionId}/nominate`, data);
  }

  public async voteInElection(electionId: string, data: IVoteRequest): Promise<{ message: string }> {
    return this.httpService.post(`elections/${electionId}/vote`, data);
  }

  // --- National Bank ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async createNationalBank(stateId: string, data: { name?: string }): Promise<any> {
    return this.httpService.post(`states/${stateId}/bank`, data);
  }

  // --- Treasury ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getStateTreasury(stateId: string): Promise<any[]> {
    return this.httpService.get(`states/${stateId}/treasury`);
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async digitizeTreasury(stateId: string): Promise<{ message: string; items: any[] }> {
    return this.httpService.post(`states/${stateId}/treasury/digitize`, {});
  }



  // --- Streets ---
  async getStreets(settlementId: string): Promise<IStreet[]> {
    return this.httpService.get<IStreet[]>(`settlements/${settlementId}/streets`);
  }

  async createStreet(settlementId: string, name: string): Promise<IStreet> {
    return this.httpService.post<IStreet, { name: string }>(`settlements/${settlementId}/streets`, { name });
  }

  async updateStreet(settlementId: string, streetId: string, name: string): Promise<IStreet> {
    return this.httpService.put<IStreet, { name: string }>(`settlements/${settlementId}/streets/${streetId}`, { name });
  }

  async deleteStreet(settlementId: string, streetId: string): Promise<void> {
    await this.httpService.delete(`settlements/${settlementId}/streets/${streetId}`);
  }

  // --- Territories ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getTerritories(): Promise<any[]> {
    return this.httpService.get(`territories`);
  }

  async deleteTerritoryWeb(territoryId: string): Promise<{ success: boolean }> {
    return this.httpService.delete(`territories/${territoryId}`);
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  async toggleTerritoryVisibility(territoryId: string, isHiddenOnMap: boolean): Promise<any> {
    return this.httpService.patch(`territories/${territoryId}/visibility`, { isHiddenOnMap });
  }
}

export const statesService = new StatesService(httpFactoryService.createAuthHttpService());

