# Generated by Django 2.1.7 on 2019-03-02 00:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='square',
            name='has_flag',
            field=models.BooleanField(default=False),
        ),
    ]