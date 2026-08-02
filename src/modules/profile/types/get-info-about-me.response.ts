export type GetInfoAboutMeRespone = {
  id: string;
  username: string;
  uuid: string;
  email: string;
  emailIsConfirmed: boolean;
  lastIp: string;
  avatar_img: string | null;
  cityId?: string | null;
  stateId?: string | null;
};
