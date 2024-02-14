#third party import
from rest_framework import serializers

#In house imports
from plane.db.models import (TimeSheet,Workspace)
from . import (UserLiteSerializer,IssueLiteSerializer)

class TimeSheetSerializer(serializers.ModelSerializer): 
    def create(self, validated_data):
        timesheet=TimeSheet.objects.create(**validated_data,actor=self.context.get('user'))  
        return timesheet
    class Meta:
        model=TimeSheet
        fields="__all__"
    