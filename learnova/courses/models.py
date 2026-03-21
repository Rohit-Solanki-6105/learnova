from django.db import models
from django.conf import settings

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Course(models.Model):
    VISIBILITY_CHOICES = (
        (1, 'Everyone'),
        (2, 'Only Invited by Instructor/Admin'),
    )
    STATUS_CHOICES = (
        (1, 'Draft'),
        (2, 'Published'),
        (3, 'Archived'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='created_courses', on_delete=models.SET_NULL, null=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='updated_courses', on_delete=models.SET_NULL, null=True)
    visibility = models.IntegerField(choices=VISIBILITY_CHOICES, default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    thumbnail = models.URLField(max_length=500, null=True, blank=True)
    status = models.IntegerField(choices=STATUS_CHOICES, default=1)
    total_lesson = models.IntegerField(default=0)
    total_duration = models.IntegerField(default=0, help_text="Duration in minutes or seconds")
    responsible = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='responsible_courses', on_delete=models.SET_NULL, null=True)
    tags = models.ManyToManyField(Tag, related_name='courses', blank=True, db_table='tagged_courses')

    def __str__(self):
        return self.title


class Lesson(models.Model):
    course = models.ForeignKey(Course, related_name='lessons', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    data = models.JSONField(null=True, blank=True, help_text="JSON data using editor.js")
    sequence = models.IntegerField(default=0)

    def __str__(self):
        return self.title


class Attachment(models.Model):
    ATTACHMENT_TYPE_CHOICES = (
        (1, 'File'),
        (2, 'Link'),
    )
    lesson = models.ForeignKey(Lesson, related_name='attachments', on_delete=models.CASCADE)
    attachment_url = models.URLField(max_length=500)
    attachment_name = models.CharField(max_length=255)
    attachment_type = models.IntegerField(choices=ATTACHMENT_TYPE_CHOICES, default=1)

    def __str__(self):
        return self.attachment_name
