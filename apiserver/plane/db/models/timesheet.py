from django.db import models
from . import ProjectBaseModel
from . import Issue
from django.conf import settings


class TimeSheet(ProjectBaseModel):
    duration=models.PositiveIntegerField()
    issue=models.ForeignKey(Issue, related_name="issue_timesheet", on_delete=models.SET_NULL,null=True)
    actor=models.ForeignKey( settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="issue_timesheet_activity")
    created_at=models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.actor}-{self.duration}"
    
