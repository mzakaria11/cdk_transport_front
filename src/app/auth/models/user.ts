import { Role } from './role';

export class User {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: Role;
  _roles?: Role[];
  token?: string;
  refresh_token?: string;
  authenticated?: boolean;
}
