import consola from 'consola';
// import fs from 'fs';

(async () => {
  // *****************************************
  // let authorizedUser = { id: 42, name: 'Vipul' };
  // consola.log(authorizedUser);
  // // {id: 42, name: "Vipul"}
  // // Old way
  // if (authorizedUser) {
  //   authorizedUser = { ...authorizedUser, admin: true };
  // }
  // consola.log(authorizedUser);
  // // {id: 42, name: "Vipul", admin: true}
  //
  // // With ES2021
  // authorizedUser &&= { ...authorizedUser, admin: true };
  // console.log(authorizedUser);
  // // {id: 42, name: "Vipul", admin: true}
  let variable = 0;
  variable += 10000;
  variable = variable || 10000;
  consola.info(variable);

  let variable2021LogicalOR = 0;
  variable2021LogicalOR ||= 10_000;
  consola.info('variable2021LogicalOR:', variable2021LogicalOR);
  let variable2021LogicalAND = 0;
  variable2021LogicalAND &&= 20_000;
  consola.info('variable2021LogicalAND:', variable2021LogicalAND);

  // ******************************************
  interface IUsers{
    id: number,
    name: string
  }
  const users: IUsers[] = [
    { id: 1, name: 'dimon' },
    { id: 2, name: 'danik' },
    { id: 3, name: 'katerina' },
  ];
  const tmpUser = users.map((u: IUsers) => [u.id, u]);
  console.info('tmpUser:', tmpUser);
  // tmpUser: [
  //   [ 1, { id: 1, name: 'dimon' } ],
  //   [ 2, { id: 2, name: 'danik' } ],
  //   [ 3, { id: 3, name: 'katerina' } ]
  // ]

  const userById = Object.fromEntries(users.map((u) => [u.id, u]));
  console.info(users);
  // [
  //   { id: 1, name: 'dimon' },
  //   { id: 2, name: 'danik' },
  //   { id: 3, name: 'katerina' }
  // ]
  //
  //

  consola.info('userById:', userById);

  // userById: {
  //   '1': { id: 1, name: 'dimon' },
  //   '2': { id: 2, name: 'danik' },
  //   '3': { id: 3, name: 'katerina' }
  // }

  consola.info('userById:', userById[1]);
  // userById: { id: 1, name: 'dimon' }

  const target: any = {};
  const wr: any = new WeakRef(target);
  // wr and target aren't the same
  consola.info(target);
  consola.info(wr);
})();
