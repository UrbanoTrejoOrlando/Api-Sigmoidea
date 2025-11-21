from django.contrib import admin
from .models import SigmoidParameters

@admin.register(SigmoidParameters)
class SigmoidParametersAdmin(admin.ModelAdmin):
    list_display = ['id', 'x_shift', 'steepness', 'created_at']
    list_filter = ['created_at']