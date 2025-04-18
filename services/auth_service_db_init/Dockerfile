FROM flyway/flyway:latest

RUN mkdir -p /flyway/scripts
RUN mkdir -p /sqlite_db_data
RUN mkdir -p /flyway/sql
RUN mkdir -p /dashboard_db_data
RUN mkdir -p /friends_db_data

COPY ./init_sqlite.sh /flyway/scripts

COPY ./migrations /flyway/sql

RUN chmod +x /flyway/scripts/init_sqlite.sh

ENTRYPOINT ["/bin/sh", "/flyway/scripts/init_sqlite.sh"]