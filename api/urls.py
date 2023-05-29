from django.urls import path
# from .views import main (function import, below is class import)
from .views import RoomView

urlpatterns = [ 
    # path('', main),
    path('room', RoomView.as_view())
]
