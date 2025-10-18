
export interface User {
  sub: string;
  email: string;
  role: string;
  isAdmin: boolean;
  session_id?: string | number;
}
