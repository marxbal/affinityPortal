export class PaymentNotificationRequest {
  responseCode: string;
  responseMessage: string;
  responseAdvise: string;
  responseId: string;
  responseAuthCode: string;
  merchantId: string;
  requestId: string;
  signature: string;
  policyNo: string;

  constructor(init ? : Partial < PaymentNotificationRequest > ) {
    Object.assign(this, init);
  }
}