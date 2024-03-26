export enum Role {
  SUPER_ADMIN = 'Super_admin',
  Admin = 'Admin',
  Client = 'Client',
  User = 'User'
}

export interface IRole {
  id: number;
  name: String
} 