import sqlite3

def main():
    conn = sqlite3.connect('db.sqlite3')
    cursor = conn.cursor()
    
    # 1. Delete 0004_alter_movie_title since it should not exist
    cursor.execute("DELETE FROM django_migrations WHERE app = 'movies' AND name = '0004_alter_movie_title'")
    
    # 2. Rename 0002_alter_title to 0002_alter_movie_title
    cursor.execute("UPDATE django_migrations SET name = '0002_alter_movie_title' WHERE app = 'movies' AND name = '0002_alter_title'")
    
    conn.commit()
    
    # Check what is left
    cursor.execute("SELECT id, app, name FROM django_migrations WHERE app = 'movies' ORDER BY id")
    print("Updated migration history for 'movies':")
    for row in cursor.fetchall():
        print(row)
        
    conn.close()

if __name__ == '__main__':
    main()
