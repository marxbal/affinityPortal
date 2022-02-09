export class FileDetails {
  documentCode: string;
  documentType: string;
  file: File = null;
  
  constructor(init?: Partial<FileDetails>) {
    Object.assign(this, init);
  }
}
