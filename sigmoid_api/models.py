from django.db import models

class SigmoidParameters(models.Model):
    x_shift = models.FloatField(default=0.0)
    steepness = models.FloatField(default=1.0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Sigmoid(x_shift={self.x_shift}, steepness={self.steepness})"