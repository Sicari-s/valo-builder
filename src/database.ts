import { Sequelize } from 'sequelize-typescript';
import { Player, PlayerH, Team, Match } from './db/models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

const sequelize =
  process.env.NODE_ENV == 'development'
    ? new Sequelize({
        dialect: 'sqlite',
        storage: 'src/db/db.sqlite',
        logging: false,
      })
    : new Sequelize(process.env.DATABASE_URL);

sequelize.addModels([Player, PlayerH, Team, Match]);

export { sequelize };
