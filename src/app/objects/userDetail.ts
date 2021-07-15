export class UserDetail {
  email: string;
  loggedInTime: string;
  roleId: number;
  token: string;
  
  constructor(init ? : Partial < UserDetail > ) {
    Object.assign(this, init);
  }
}