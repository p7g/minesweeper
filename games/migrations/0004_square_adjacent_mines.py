# Generated by Django 2.1.7 on 2019-03-02 00:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0003_square_is_revealed'),
    ]

    operations = [
        migrations.AddField(
            model_name='square',
            name='adjacent_mines',
            field=models.SmallIntegerField(default=0),
        ),
    ]