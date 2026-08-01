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
    return this.httpService.post('states', { body: data });
  }

  public async updateState(id: string, data: Partial<ICreateStateRequest>): Promise<IState> {
    return this.httpService.put(`states/${id}`, { body: data });
  }

  public async deleteState(id: string): Promise<void> {
    return this.httpService.delete(`states/${id}`);
  }

  // --- Decrees ---
  public async getDecrees(stateId: string): Promise<IStateDecree[]> {
    return this.httpService.get(`states/${stateId}/decrees`);
  }

  public async createDecree(stateId: string, data: ICreateDecreeRequest): Promise<IStateDecree> {
    return this.httpService.post(`states/${stateId}/decrees`, { body: data });
  }

  // --- Diplomacy ---
  public async getDiplomacy(stateId: string): Promise<IDiplomacy[]> {
    return this.httpService.get(`states/${stateId}/diplomacy`);
  }

  public async setDiplomacy(stateId: string, data: ISetDiplomacyRequest): Promise<IDiplomacy> {
    return this.httpService.put(`states/${stateId}/diplomacy`, { body: data });
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
    return this.httpService.post('cities', { body: data });
  }

  public async updateCity(id: string, data: Partial<ICreateCityRequest>): Promise<ICity> {
    return this.httpService.put(`cities/${id}`, { body: data });
  }

  public async deleteCity(id: string): Promise<void> {
    return this.httpService.delete(`cities/${id}`);
  }

  // --- Citizenship Requests ---
  public async getRequests(cityId: string): Promise<ICitizenshipRequest[]> {
    return this.httpService.get(`cities/${cityId}/requests`);
  }

  public async createRequest(cityId: string, data: ICreateCitizenshipRequest): Promise<ICitizenshipRequest> {
    return this.httpService.post(`cities/${cityId}/requests`, { body: data });
  }

  public async reviewRequest(
    cityId: string,
    requestId: string,
    data: IReviewCitizenshipRequest,
  ): Promise<ICitizenshipRequest> {
    return this.httpService.put(`cities/${cityId}/requests/${requestId}`, { body: data });
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
    return this.httpService.post('elections', { body: data });
  }

  public async nominateCandidate(
    electionId: string,
    data: INominateCandidateRequest,
  ): Promise<IElectionCandidate> {
    return this.httpService.post(`elections/${electionId}/nominate`, { body: data });
  }

  public async voteInElection(electionId: string, data: IVoteRequest): Promise<{ message: string }> {
    return this.httpService.post(`elections/${electionId}/vote`, { body: data });
  }
}

export const statesService = new StatesService(httpFactoryService.createAuthHttpService());
