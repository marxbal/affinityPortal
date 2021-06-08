import {AddressDetails} from './address-details';
import {CustomerContactDetail} from './customer-contact-detail';
import {Customer} from './customer';
import {AdditionalAttribute} from './additional-attribute';
import {CustomerPaymentTermMap} from './customer-payment-term';

export class AllCustomerDetails {

  customerDetails: Customer;
  paymentTermDetails: CustomerPaymentTermMap;
  addressDetails: AddressDetails[];
  contactDetails: CustomerContactDetail[];
  attributeDetails: AdditionalAttribute[];
  
}