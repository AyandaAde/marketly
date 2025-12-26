#Minimal Node template
FROM node:20
WORKDIR /app

#Node deps
COPY package*.json ./
RUN npm install

#App Source
COPY . .
EXPOSE 3000

#Start the app
CMD ["npm", "run", "start"]

#Non-root + runnable test script
RUN sed -i 's/\r$//' run_tests.sh && \
    useradd -m appuser && \
    chown -R appuser:appuser /app && \
    chmod +x run_tests.sh
USER appuser

# Grader will pass <task-id> as an argument
ENTRYPOINT ["bash", "run_tests.sh"]
