const express = require('express');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

app.use(express.json());

// Configuring the graphql end point middleware
app.use(
    '/graphql',
    graphqlHttp({
        schema: buildSchema(`
        type RootQuery {
            events: [String!]!
        }

        type RootMutation {
            createEvent(name: String): String
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
        rootValue: {
            events: () => {
                return ['Romantic Cooking', 'Sailing', 'All-Night Coding'];
            },
            createEvent: args => {
                const eventName = args.name;

                return eventName;
            }
        },
        graphiql: true
    })
);

app.listen(3001, () => {
    console.log('Server is running');
});
