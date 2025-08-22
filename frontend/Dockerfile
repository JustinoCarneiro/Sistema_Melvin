FROM node:18-alpine

WORKDIR /PORTFOLIO

ARG VITE_REACT_APP_FETCH_URL
ENV VITE_REACT_APP_FETCH_URL=$VITE_REACT_APP_FETCH_URL

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "dev"]
