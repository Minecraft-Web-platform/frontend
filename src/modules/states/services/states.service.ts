import { EnhancedWithAuthHttpService } from '../../../shared/services/http-auth.service';
import { httpFactoryService } from '../../../shared/services/http-factory.service';
import {
  ICitizenshipRequest,
  ICity,
  ICreateCitizenshipRequest,
  ICreateCityRequest,
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

  // --- Cities ---
  public async getCities(stateId?: string): Promise<ICity[]> {
    const url = stateId ? `cities?stateId=${stateId}` : 'cities';
    return this.httpService.get(url);
  }

  public async getCityById(id: string): Promise<ICity> {
    return this.httpService.get(`cities/${id}`);
  }

  public async createCity(data: ICreateCityRequest): Promise<ICity> {
    return this.httpService.post('cities', data);
  }

  public async updateCity(id: string, data: Partial<ICreateCityRequest>): Promise<ICity> {
    return this.httpService.put(`cities/${id}`, data);
  }

  public async deleteCity(id: string): Promise<void> {
    return this.httpService.delete(`cities/${id}`);
  }

  public async resignMayor(id: string): Promise<void> {
    return this.httpService.post(`cities/${id}/resign`, {});
  }

  public async setCapital(cityId: string): Promise<ICity> {
    return this.httpService.post(`cities/${cityId}/capital`, {});
  }

  public async addCityImage(cityId: string, imageUrl: string): Promise<ICity> {
    return this.httpService.post(`cities/${cityId}/images`, { imageUrl });
  }

  public async removeCityImage(cityId: string, imageUrl: string): Promise<ICity> {
    // Axios DELETE with body requires passing data in config.
    // EnhancedWithAuthHttpService might just use standard Axios config.
    // If it's a simple wrapper, we can pass it as data.
    return this.httpService.delete(`cities/${cityId}/images`, { data: { imageUrl } });
  }

  // --- Citizenship Requests ---
  public async getRequests(cityId: string): Promise<ICitizenshipRequest[]> {
    return this.httpService.get(`cities/${cityId}/requests`);
  }

  public async createRequest(cityId: string, data: ICreateCitizenshipRequest): Promise<ICitizenshipRequest> {
    return this.httpService.post(`cities/${cityId}/requests`, data);
  }

  public async reviewRequest(
    cityId: string,
    requestId: string,
    data: IReviewCitizenshipRequest,
  ): Promise<ICitizenshipRequest> {
    return this.httpService.put(`cities/${cityId}/requests/${requestId}`, data);
  }

  public async leaveCity(cityId: string): Promise<{ success: boolean; message: string }> {
    return this.httpService.post(`cities/${cityId}/leave`, {});
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
  public async createNationalBank(stateId: string, data: { name?: string }): Promise<any> {
    return this.httpService.post(`states/${stateId}/bank`, data);
  }

  // --- Treasury ---
  public async getStateTreasury(stateId: string): Promise<any[]> {
    return this.httpService.get(`states/${stateId}/treasury`);
  }

  public async digitizeTreasury(stateId: string): Promise<{ message: string; items: any[] }> {
    return this.httpService.post(`states/${stateId}/treasury/digitize`, {});
  }

  public async withdrawTreasury(stateId: string, data: { minecraftItemId: string; quantity: number }): Promise<{ message: string }> {
    return this.httpService.post(`states/${stateId}/treasury/withdraw`, data);
  }

  // --- Streets ---
  async getStreets(cityId: string): Promise<IStreet[]> {
    return this.httpService.get<IStreet[]>(`cities/${cityId}/streets`);
  }

  async createStreet(cityId: string, name: string): Promise<IStreet> {
    return this.httpService.post<IStreet, { name: string }>(`cities/${cityId}/streets`, { name });
  }

  async updateStreet(cityId: string, streetId: string, name: string): Promise<IStreet> {
    return this.httpService.put<IStreet, { name: string }>(`cities/${cityId}/streets/${streetId}`, { name });
  }

  async deleteStreet(cityId: string, streetId: string): Promise<void> {
    await this.httpService.delete(`cities/${cityId}/streets/${streetId}`);
  }
}

export const statesService = new StatesService(httpFactoryService.createAuthHttpService());
