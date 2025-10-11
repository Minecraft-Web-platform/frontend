export type GetAllUsersResponse = Array<{
  avatar_img: string | null;
  id: string;
  username: string;
  uuid: string;
  email: string;
  emailIsConfirmed: boolean;
  lastIp: string;
}>;
