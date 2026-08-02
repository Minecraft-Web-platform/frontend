export type PlayerType = {
  id: number;
  username: string;
  uuid: string;
  email: string | null;
  emailIsConfirmed: boolean;
  lastIp: string;
  avatar_img: string | null;
  registrationDate: string;
  cityId?: string | null;
  stateId?: string | null;
  cityName?: string | null;
  stateName?: string | null;
};
