# Test Jubelio Backend

## Installation
  - Open your terminal in root project folder
  - Type 'npm install'
  - You have to make DB in your local machine
  - Copy '.env.example' to '.env' and change variable values with your local machine settings

## Migrations (using knex dependecy) 
  - Open your terminal in root project folder
  - type 'npm run knex migrate:latest'
  ### Note:
  - because knex dependecy is install locally in project not global (for my local machine), you have to add 'knex' on scripts section in 'package.json'