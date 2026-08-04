export type GetAllUsersResponse = Array<{
  avatar_img: string | null;
  id: string;
  username: string;
  uuid: string;
  email: string;
  emailIsConfirmed: boolean;
  lastIp?: string;
  stateId?: string | null;
  stateName?: string | null;
  citizenshipName?: string | null;
  stateFlagUrl?: string | null;
  stateCoatOfArmsUrl?: string | null;
  nationalityMale?: string | null;
  nationalityFemale?: string | null;
  role?: "player" | "economist" | "admin";
  isAdmin?: boolean;
  isEconomist?: boolean;
}>;
