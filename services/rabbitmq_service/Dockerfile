FROM rabbitmq:4.0.7-management
COPY rabbitmq.conf /etc/rabbitmq/rabbitmq.conf
COPY definitions.json /etc/rabbitmq/definitions.json
ENV RABBITMQ_LOAD_DEFINITIONS=/etc/rabbitmq/definitions.json
EXPOSE 5672 15672
