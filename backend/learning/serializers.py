from rest_framework import serializers
from .models import Course, LearningLog

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ('user',)

class LearningLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningLog
        fields = '__all__'
        read_only_fields = ('user',)
