#!/bin/sh

DB_PATH_AUTH="/auth_db_data/auth_service.sqlite"
DB_PATH_DASHBOARD="/dashboard_db_data/dashboard_service.sqlite"
DB_PATH_FRIENDS="/friends_db_data/friends_service.sqlite"
DB_PATH_TOURNAMENT="/tournament_db_data/tournament_service.sqlite"

# Ensure the SQLite (AUTH SERVICE) file exists
echo "Checking Auth DB file at $DB_PATH_AUTH..."
if [ ! -f "$DB_PATH_AUTH" ]; then
    echo "Creating new SQLite database at $DB_PATH_AUTH"
    touch "$DB_PATH_AUTH"
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

echo " "
# Ensure the tournaments (TOURNAMENT SERVICE) database file exists
echo "Checking tournaments DB SQLite file at $DB_PATH_TOURNAMENT..."
if [ ! -f "$DB_PATH_TOURNAMENT" ]; then
    echo "Creating new tournaments service database at $DB_PATH_TOURNAMENT"
    touch "$DB_PATH_TOURNAMENT"
else
    echo "Tournament service database already exists."
fi

echo " "
# Run Flyway migrations
echo "Running Flyway migrations for auth_service"
# patch to sqlite file                              #path to migrations files
flyway migrate -url=jdbc:sqlite:$DB_PATH_AUTH -locations=filesystem:/flyway/sql/auth

echo "Running Flyway migration for dashboard_service"
# patch to sqlite file                              #path to migrations files
flyway migrate -url=jdbc:sqlite:$DB_PATH_DASHBOARD -locations=filesystem:/flyway/sql/dashboard

echo "Running Flyway migration for friends_service"
# patch to sqlite file                              #path to migrations files
flyway migrate -url=jdbc:sqlite:$DB_PATH_FRIENDS -locations=filesystem:/flyway/sql/friends

echo "Running Flyway migration for tournament_service"
# patch to sqlite file                              #path to migrations files
flyway migrate -url=jdbc:sqlite:$DB_PATH_TOURNAMENT -locations=filesystem:/flyway/sql/tournament


# ---------------------------------------------------------------------------
# 2. HAND-OFF: give the data to UID 1000 so the runtime services can use it
# ---------------------------------------------------------------------------
echo
echo "---- Changing ownership to UID 1000 -------------------------------------"
chown -R 1000:1000 \
      /auth_db_data \
      /dashboard_db_data \
      /friends_db_data \
      /tournament_db_data \
      /static_data \
      /frontend_data \

echo "All done – SQLite files are now owned by UID 1000."