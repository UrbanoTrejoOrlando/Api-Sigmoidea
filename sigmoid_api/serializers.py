from rest_framework import serializers
from .models import SigmoidParameters

class SigmoidParametersSerializer(serializers.ModelSerializer):
    class Meta:
        model = SigmoidParameters
        fields = ['id', 'x_shift', 'steepness', 'created_at']