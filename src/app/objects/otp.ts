export class OTP {

  email: string;
  otp: string;

  constructor(init ? : Partial < OTP > ) {
    Object.assign(this, init);
  }

}