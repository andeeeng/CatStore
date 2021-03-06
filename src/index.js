import {ApolloServer, gql} from 'apollo-server-express';
import express from 'express';
import mongoose from 'mongoose';
import {resolvers} from './graphql/resolvers';
import {typeDefs} from './graphql/typeDefs';
import schema from './graphql';
import {models} from './server';
import {sheets} from './server';

import {sheeez} from 'gsheeez';
import {google} from 'googleapis';

const gshez = sheeez({
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  token_path: 'token.json',
  creds_path: 'credentials.json',
  google,
});

const catsSheet = gshez.create({
  spreadsheetId: '1wKpKdGNL34VEE3iP-tavpSgkps2Ax_rvQgd3f3uArI4',
  range: 'A:C',
});

const startServer = async () => {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    schema,
    context: {
      models,
      sheets: {
        cats: await (async () => {
          const grid = await catsSheet.grid({headerLength: 1});
          sheets.CatSheet.setGrid(grid);
          return sheets.CatSheet;
        })(),
      },
    },
  });

  server.applyMiddleware({app});

  await mongoose.connect('mongodb://localhost:27017/test3', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  app.listen({port: 4000}, () =>
    console.log(
      `🚀  Server ready at http://localhost:4000${server.graphqlPath}`,
    ),
  );
};

startServer();
