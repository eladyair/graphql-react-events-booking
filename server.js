const express = require('express');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

const events = [];

app.use(express.json());

// Configuring the graphql end point middleware
// a few explanations on the configuration below:
// 1. ! - means it's required and can't be null
// 2. In the schema section we will define in a string the way qraphql will give us access to the data we want:
//  2.1. We start by defining 3 things:
//    2.1.1 The RootQuery (can be called how we want) will hold the queries for the data
//    2.1.2 The RootMutation (can be called how we want) will hold the crud operations to mutate our data
//    2.1.3 The schema will hold all of the options for graphql like query, mutation, resolver and subscriptions as key and their values will be the ones like from 2.1.1 & 2.1.2
//
app.use(
    '/graphql',
    graphqlHttp({
        schema: buildSchema(`        
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
        rootValue: {
            events: () => {
                return events;
            },
            createEvent: args => {
                const event = {
                    _id: Math.random().toString(),
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: args.eventInput.date
                };

                events.push(event);

                return event;
            }
        },
        graphiql: true
    })
);

app.listen(3001, () => {
    console.log('Server is running');
});
