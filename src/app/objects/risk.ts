import {AddressDetails} from './address-details';
import {MarshCoverages} from './marsh-coverages';

export class Risk {

  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  nationality: string;
  suffix: string;
  gender: string;
  civilStatus: string;
  birthDate: string;
  birthPlace: string;
  emailAddress: string;
  phoneNumber: string;
  residenceNumber: string;
  companyNumber: string;
  businessNature: string;
  workNature: string;
  employerName: string;
  fundSource: string;
  mailingAddressId: string;
  TIN: string;
  SSS: string;
  validID: string;
  validIDValue: string;
  religion: string;
  fatherName: string;
  fatherBirthday: string;
  motherName: string;
  motherBirthday: string;
  spouseName: string;
  spouseBirthday: string;
  children1Name: string;
  children1Birthday: string;
  children2Name: string;
  children2Birthday: string;
  helper1Name: string;
  helper1Birthday: string;
  helper2Name: string;
  helper2Birthday: string;
  helper3Name: string;
  helper3Birthday: string;
  separator: string;
  separatorText: string;
  prefix: string;
  relationship: string;
  preExistingIllness: string;
  occupationalClass: string;
  occupation: string;
  healthDeclaration: boolean;
  underTaking: boolean;
  correspondentAddress: AddressDetails = new AddressDetails();
  homeAddress: AddressDetails = new AddressDetails();
  officeAddress: AddressDetails = new AddressDetails();
  billingAddress: AddressDetails = new AddressDetails();
  mailingAddress: AddressDetails = new AddressDetails();
  coveragesValue: MarshCoverages[] = [];
  
}