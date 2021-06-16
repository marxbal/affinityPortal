export class Return {

  status: boolean;
  statusCode: number;
  obj: object;
  message: string;

  constructor(init ? : Partial < Return > ) {
    Object.assign(this, init);
  }

}