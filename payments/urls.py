from django.urls import path
from .views import STKPushView, mpesa_callback, RegisterView  # This is the view Dev 4 is writing

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    # When React hits /api/payments/stk-push/, it triggers STKPushView
    path('stk-push/', STKPushView.as_view(), name='stk_push'),
    path('callback/', mpesa_callback, name='mpesa_callback'),
]