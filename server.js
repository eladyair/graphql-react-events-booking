const express = require('express');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

// Models
const Event = require('./models/event');

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
                return Event.find()
                    .then(events => {
                        return events.map(event => {
                            //return { ...event._doc, _id: event._doc._id.toString() }; // OR
                            return { ...event._doc, _id: event.id }; // The same as above, only simpler. mongoose gives this option
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        throw err;
                    });
            },
            createEvent: args => {
                const event = new Event({
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: new Date(args.eventInput.date)
                });

                return event
                    .save()
                    .then(event => {
                        return { ...event._doc, _id: event.id }; // Returning the core data of the event without the rest of the metadata
                    })
                    .catch(err => {
                        console.log(err);
                        throw err;
                    });
            }
        },
        graphiql: true
    })
);

mongoose
    .connect(
        `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@eventsbooking-2sp0f.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )
    .then(() => {
        console.log('Connected To Mongo!');

        app.listen(3001, () => {
            console.log('Server is running');
        });
    })
    .catch(err => console.log(err));
