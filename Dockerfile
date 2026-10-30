FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json server.mjs ./
COPY scripts/project-seo.mjs ./scripts/project-seo.mjs
COPY public ./public
USER node
EXPOSE 3000
CMD ["node", "server.mjs"]
