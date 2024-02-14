from django.db import models
from . import ProjectBaseModel
from . import Issue
from django.conf import settings


class TimeSheet(ProjectBaseModel):
    workedhour=models.PositiveIntegerField()
    issue=models.ForeignKey(Issue, related_name="issue_timesheet", on_delete=models.SET_NULL,null=True)
    actor=models.ForeignKey( settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="issue_timesheet_activity")
    description=models.CharField(max_length=100,blank=True,default='No message')
    
    
    
    def __str__(self):
        return f"{self.actor}-{self.duration}"
    
