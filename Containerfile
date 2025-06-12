FROM docker.io/node:20-bullseyeAdd commentMore actions

COPY src $HOME/copilot-dash
RUN cd dashboard && npm install

WORKDIR dashboard

ENTRYPOINT ["npm", "run", "dev"]
