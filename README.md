#Elmo

## Pre Install
After getting the source, you will need to install
- RabbitMq
- MongoDb

On the mac you can use brew
- sudo brew install rabbitmq
- sudo brew install mongodb

To run these programs, from a shell
- sudo /usr/local/sbin/rabbitmq-server
- sudo launchctl load -F /usr/local/Cellar/mongodb/2.0.1-x86_64/org.mongodb.mongod.plist

## Running Elmo

First we need the elmo npm dependencies.

From the following directories you need to run npm install to fetch the dependencies:
- shared/
- agent/
- www/

Then to run the agent, from the project root type *node agent/app.js*

And the www server, *node www/app.js*
