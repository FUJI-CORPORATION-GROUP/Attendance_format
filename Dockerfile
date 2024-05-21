FROM node:lts

WORKDIR /usr/src/app

RUN npm i @google/clasp -g
