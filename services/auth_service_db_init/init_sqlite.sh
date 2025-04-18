#!/bin/sh

DB_PATH="/sqlite_db_data/auth_service.sqlite"
DB_PATH_DASHBOARD="/dashboard_db_data/dashboard_service.sqlite"
DB_PATH_FRIENDS="/friends_db_data/friends_service.sqlite"

# Ensure the SQLite database file exists
echo "Checking SQLite file at $DB_PATH..."
if [ ! -f "$DB_PATH" ]; then
    echo "Creating new SQLite database at $DB_PATH"
    touch "$DB_PATH"
else
    echo "Auth service database already exists."
fi

echo " "
# Ensure the SQLite (DASHBOARD) database file exists
echo "Checking Dashboard DB SQLite file at $DB_PATH_DASHBOARD..."
if [ ! -f "$DB_PATH_DASHBOARD" ]; then
    echo "Creating new Dashboard service database at $DB_PATH_DASHBOARD"
    touch "$DB_PATH_DASHBOARD"
else
    echo "Dashboard service database already exists."
fi

echo " "
# Ensure the friends (FRIENDS SERVICE) database file exists
echo "Checking friends DB SQLite file at $DB_PATH_FRIENDS..."
if [ ! -f "$DB_PATH_FRIENDS" ]; then
    echo "Creating new friends service database at $DB_PATH_FRIENDS"
    touch "$DB_PATH_FRIENDS"
else
    echo "Friend service database already exists."
fi


# Run Flyway migrations
echo "Running Flyway migrations for auth_service"
# patch to sqlite file                              #path to migrations files
flyway migrate -url=jdbc:sqlite:$DB_PATH -locations=filesystem:/flyway/sql/sqlite

echo "Running Flyway migration for dashboard_service"
# patch to sqlite file                              #path to migrations files
flyway migrate -url=jdbc:sqlite:$DB_PATH_DASHBOARD -locations=filesystem:/flyway/sql/dashboard

echo "Running Flyway migration for friends_service"
# patch to sqlite file                              #path to migrations files
flyway migrate -url=jdbc:sqlite:$DB_PATH_FRIENDS -locations=filesystem:/flyway/sql/friends
