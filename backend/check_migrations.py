import sqlite3
import sys

def main():
    conn = sqlite3.connect('db.sqlite3')
    cursor = conn.cursor()
    cursor.execute("SELECT id, app, name FROM django_migrations WHERE app = 'movies' ORDER BY id")
    rows = cursor.fetchall()
    for row in rows:
        print(row)

if __name__ == '__main__':
    main()
