#third party import
from rest_framework import serializers

#In house imports
from plane.db.models import (TimeSheet,Workspace)
from . import (UserLiteSerializer,IssueLiteSerializer)

class TimeSheetSerializer(serializers.ModelSerializer): 
    created_at=serializers.DateTimeField()
    def create(self, validated_data):
        timesheet=TimeSheet.objects.create(**validated_data,actor=self.context.get('user'))
        timesheet.created_at=validated_data.get('created_at')
        timesheet.save()
        return timesheet
    class Meta:
        model=TimeSheet
        fields=['workedhour','description','actor','issue','created_at','project']
    