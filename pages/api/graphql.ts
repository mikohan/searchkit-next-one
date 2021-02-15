import { ApolloServer, gql } from 'apollo-server-micro';
import { MultiMatchQuery, SearchkitSchema } from '@searchkit/schema';

const searchkitConfig = {
  host: 'http://localhost:9200',
  index: 'imdb_movies',
  hits: {
    fields: [],
  },
  query: new MultiMatchQuery({ fields: [] }),
  facets: [],
};

// Returns SDL + Resolvers for searchkit, based on the Searchkit config
const { typeDefs, withSearchkitResolvers, context } = SearchkitSchema({
  config: searchkitConfig, // searchkit configuration
  typeName: 'ResultSet', // type name for Searchkit Root
  hitTypeName: 'ResultHit', // type name for each search result
  addToQueryType: true, // When true, adds a field called results to Query type
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const server = new ApolloServer({
  typeDefs: [
    gql`
      type Query {
        root: String
      }

      type HitFields {
        title: String
        writers: [String]
        actors: [String]
        plot: String
        poster: String
      }

      type ResultHit implements SKHit {
        id: ID!
        fields: HitFields
      }
    `,
    ...typeDefs,
  ],
  resolvers: withSearchkitResolvers({}),
  introspection: true,
  playground: true,
  context: {
    ...context,
  },
});

export default server.createHandler({ path: '/api/graphql' });
