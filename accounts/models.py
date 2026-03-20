from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver

class User(AbstractUser):
    """
    Custom User model for Rejea.
    """
    email = models.EmailField(unique=True)
    
    # These fields match your database constraints
    is_driver = models.BooleanField(default=False)
    is_passenger = models.BooleanField(default=False) 

    def __str__(self):
        return self.username

class UserProfile(models.Model):
    ROLE_CHOICES = (
        ('passenger', 'Passenger'),
        ('driver', 'Driver'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=20, choices=ROLE_CHOICES, default='passenger')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    
    # Verification Fields
    is_verified = models.BooleanField(default=False)
    id_number = models.CharField(max_length=20, blank=True, null=True, unique=True)
    license_number = models.CharField(max_length=20, blank=True, null=True, unique=True)
    
    # Image Storage (Requires Pillow: pip install Pillow)
    license_image = models.ImageField(upload_to='verification/licenses/', blank=True, null=True)
    profile_photo = models.ImageField(upload_to='verification/profiles/', blank=True, null=True)
    
    date_joined = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        status = "VERIFIED" if self.is_verified else "PENDING"
        return f"{self.user.username} | {self.user_type.upper()} | {status}"

# --- SIGNALS (FIXED VERSION) ---

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, created, **kwargs):
    # Only save if the profile already exists. 
    # Let the Serializer handle the actual creation.
    if hasattr(instance, 'profile'):
        instance.profile.save()