import sqlite3
import sys

def main():
    conn = sqlite3.connect('db.sqlite3')
    cursor = conn.cursor()
    # Delete any potential duplicate 0002_alter_movie_title if it accidentally got added
    cursor.execute("DELETE FROM django_migrations WHERE app = 'movies' AND name = '0002_alter_movie_title'")
    
    # Update the old 0002_alter_title to the new filename 0002_alter_movie_title
    cursor.execute("UPDATE django_migrations SET name = '0002_alter_movie_title' WHERE app = 'movies' AND name = '0002_alter_title'")
    
    conn.commit()
    conn.close()
    print("Database migrations table successfully updated!")

if __name__ == '__main__':
    main()
