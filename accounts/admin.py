from django.contrib import admin
from django.utils.html import format_html
from .models import User, UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    # 1. Configuration for the main list view
    list_display = ('user_username', 'user_type', 'is_verified', 'id_number', 'license_preview', 'date_joined')
    list_filter = ('user_type', 'is_verified', 'date_joined')
    search_fields = ('user__username', 'id_number', 'license_number', 'phone_number')
    
    # Allows you to toggle verification status without leaving the list page
    list_editable = ('is_verified',)
    
    # 2. Grouping fields when you click to edit a specific driver
    fieldsets = (
        ('Account Identity', {
            'fields': ('user', 'user_type', 'phone_number')
        }),
        ('Verification Documents', {
            'fields': ('id_number', 'license_number', 'license_image', 'profile_photo')
        }),
        ('Approval Status', {
            'fields': ('is_verified',)
        }),
    )

    # 3. Custom Methods for a better interface
    def user_username(self, obj):
        return obj.user.username
    user_username.short_description = 'Username'

    def license_preview(self, obj):
        """Displays a small thumbnail of the license in the list view"""
        if obj.license_image:
            return format_html('<img src="{}" style="width: 45px; height:30px; border-radius: 4px;" />', obj.license_image.url)
        return "No Image"
    license_preview.short_description = 'License'

    # 4. Custom Admin Actions (Bulk Verification)
    actions = ['approve_drivers', 'reject_drivers']

    @admin.action(description='Approve selected drivers')
    def approve_drivers(self, request, queryset):
        queryset.update(is_verified=True)
        self.message_user(request, "Selected drivers have been verified and can now go live.")

    @admin.action(description='Revoke verification for selected users')
    def reject_drivers(self, request, queryset):
        queryset.update(is_verified=False)
        self.message_user(request, "Verification revoked for selected users.")

    def get_queryset(self, request):
        """Optimization: reduces database hits on your Snapdragon"""
        return super().get_queryset(request).select_related('user')