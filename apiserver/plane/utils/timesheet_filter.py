from django.utils import timezone
from datetime import datetime,timedelta

def filter_by_date(daterange,filter,method):
    dates=daterange.split(',')
    if len(dates) ==2:
        filter['created_at__gte']=dates[0]
        filter['created_at__lte']=dates[1]
        # filter["created_at__range"]=dates

        return filter


def timesheet_filter(query_params,method):
    filter={}
    TIME_SHEET_FILTER ={
        'created_at':filter_by_date
    }

    for i in query_params:
        if func := TIME_SHEET_FILTER.get(i,None):
            func(query_params[i],filter,method)
    return filter
        

