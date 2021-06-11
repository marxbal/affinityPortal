export class Users {

  accountNumber: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName: string;
  contactNumber: string;
  email: string;
  status: string;
  userId: string;
  customerId: string;
  manningAgencyId: string;
  dateAdded: string;
  roleId: string;
  unitNo: string;
  token: string;
  
  constructor(init ? : Partial < Users > ) {
    Object.assign(this, init);
  }
}