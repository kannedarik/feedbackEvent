FROM docker.rupeek.com/base_image/node:12.16.1
USER appuser
COPY --chown=appuser . /app
EXPOSE 7000
CMD ["node", "./src/index.js"]
