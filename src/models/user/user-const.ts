import { genSalt, hash } from 'bcrypt';

export enum UserTypes {
  BASIC = 'basic',
  ADMIN = 'admin',
  MOD = 'mod',
  MASTER = 'master',
}

export enum UserTypesOptionsEnum {
  BASIC = 'basic',
  ADMIN = 'admin',
  MOD = 'mod',
}

export const UserTypesOptions: string[] = ['basic', 'admin', 'mod'];

export async function hashPass(pass: string): Promise<string> {
  const saltRound: number = 10;
  const newPassword = pass || this.password;
  return new Promise<string>((resolve, reject) => {
    genSalt(saltRound).then((bcSaltRound) =>
      hash(newPassword, bcSaltRound)
        .then((hashPass) => resolve(hashPass))
        .catch((error) => reject(error)),
    );
  });
}
