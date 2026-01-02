from rest_framework import serializers
from .models import DailyHealthLog

class DailyHealthLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyHealthLog
        fields = '__all__'
        read_only_fields = ('user', 'created_at')
