export class Return {

  status: boolean;
  obj: object;
  message: string;

  constructor(init ? : Partial < Return > ) {
    Object.assign(this, init);
  }

}