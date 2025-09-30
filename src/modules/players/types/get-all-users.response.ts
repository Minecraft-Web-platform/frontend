export type GetAllUsersResponse = Array<{
  id: string;
  username: string;
  uuid: string;
  email: string;
  emailIsConfirmed: boolean;
  lastIp: string;
}>;
