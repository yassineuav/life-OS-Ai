from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import analyze_risk

class DailyPredictionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        analysis = analyze_risk(request.user)
        return Response(analysis)
