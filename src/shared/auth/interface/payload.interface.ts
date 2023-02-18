export interface PayloadInterface {
  sub: string;
  context: {
    username: string;
    extra: number;
    type: string;
  };
}
