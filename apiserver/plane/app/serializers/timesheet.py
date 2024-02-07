#third party import
from rest_framework import serializers

#In house imports
from plane.db.models import (TimeSheet,)
from . import (UserLiteSerializer,IssueLiteSerializer)

class TimeSheetSerializer(serializers.ModelSerializer): 
    user=UserLiteSerializer(source='actor',read_only=True)
    issuedata=IssueLiteSerializer(source='issue',read_only=True)
    def create(self, validated_data):
        timesheet=TimeSheet.objects.create(**validated_data,actor=self.context.get('user'))  
        return timesheet
    class Meta:
        model=TimeSheet
        fields="__all__"