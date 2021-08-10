export class PaymentPaynamics {
  requestId: string;
  ipAddress: string;
  cancelUrl: string;
  mtacUrl: string;
  descriptorNote: string;
  firstName: string;
  middleName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  email: string;
  phone: string;
  mobile: string;
  itemName: string;
  quantity: string;
  amount: string;
  trxType: string;
  paymentMethod: string;
  responseUrl: string;
  appNotifUrl: string;
  policyNumber: string;
  receipt: string;

  constructor(init ? : Partial < PaymentPaynamics > ) {
    Object.assign(this, init);
  }
}