// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { User, Blog, Post, Comment } = initSchema(schema);

export {
  User,
  Blog,
  Post,
  Comment
};