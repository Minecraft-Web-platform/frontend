export type PlayerType = {
  id: number;
  username: string;
  uuid: string;
  email: string | null;
  emailIsConfirmed: boolean;
  lastIp: string;
  avatarUrl: string | null;
};
