from django.urls import path
# from .views import main (function import, below is class import)
from .views import RoomView, CreateRoomView

urlpatterns = [ 
    # path('', main),
    path('room', RoomView.as_view()),
    path('create-room', CreateRoomView.as_view())
]
