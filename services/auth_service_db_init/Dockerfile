FROM flyway/flyway:latest

RUN mkdir -p /flyway/scripts
RUN mkdir -p /sqlite_db_data
RUN mkdir -p /flyway/sql

COPY ./init_sqlite.sh /flyway/scripts

COPY ./migrations /flyway/sql

RUN chmod +x /flyway/scripts/init_sqlite.sh

ENTRYPOINT ["/bin/sh", "/flyway/scripts/init_sqlite.sh"]