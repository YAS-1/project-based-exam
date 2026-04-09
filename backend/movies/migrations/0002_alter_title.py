from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ("movies", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="movie",
            name="title",
            field=models.CharField(max_length=255, unique=True),
        ),
    ]