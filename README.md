# Test Jubelio Backend

## Installation
  1. Open your terminal in root project folder
  2. Type 'npm install'
  3. You have to make DB in your local machine
  4. Copy '.env.example' to '.env' and change variable values with your local machine settings

## Migrations (using knex packages) 
  1. Open your terminal in root project folder
  2. type 'npm run knex migrate:latest'
  ### Note:
  - because knex dependecy is install locally in project not global (for my local machine), i have to add 'knex' on scripts section in 'package.json'

## Run APP
  1. Open your terminal in root project folder
  2. type 'npm run dev' to start with nodemon or type 'npm run start' to start without nodemon

# API Documentation using Postman
Link: 
File: Jubelio-test.postman_collection.json

## Using file
1. you must install Postman first
2. import file 'Jubelio-test.postman_collection.json' to your postman collection
3. change 'base_url' variable on your setting Variables Collection (default: http://localhost:5000)
