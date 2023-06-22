from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import generics, status
from .models import Room
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse

# Create your views here.
# def main (request):
#     return HttpResponse('<h1>Hello</h1>')

class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer
    
    def post(self, request, format=None):
        # Create session, if one does not exist yet
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            # Data to append and;
            
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key

            ## Update existing information with data sent or,
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            ## If no room exist for a user, create one
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save() 
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
        
        return Response({'Bad Request': 'Invalid Data'}, status=status.HTTP_404_NOT_FOUND)

class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            room = Room.objects.filter(code=code)
            if len(room) > 0:
                data = RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key == room[0].host
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'Bad Reuest': 'Code parameter not found in  request'}, status=status.HTTP_400_BAD_REQUEST)

class JoinRoom(APIView):
    lookup_url_kwarg = 'code'

    def post(self, request, format=None):
        # Create session, if one does not exist yet
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_result = Room.objects.filter(code=code)
            if len(room_result) > 0:
                room = room_result[0]
                self.request.session['room_code'] = code
                return Response({'message': 'Room Joined Successfully.'}, status=status.HTTP_200_OK)

            return Response({'Bad Request': 'Invalid Room Code Provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({'Bad Request': 'Room code not provided.'}, status=status.HTTP_400_BAD_REQUEST)
    
class UserInRoom(APIView):
    def get(self, request, format=None):
        # Create session, if one does not exist yet
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {
            'code': self.request.session.get('room_code')
        }

        # console.log equivalent
        print(data)

        if data == { 'code': None }:
            errorData = 'Room code not provided'
            return Response({'Missing Data': errorData}, status=status.HTTP_404_NOT_FOUND)

        return JsonResponse(data, status=status.HTTP_200_OK)

class LeaveRoom(APIView):
    def post(self, request, format=None):
        # if 'room_code' in self.request.session:
        #     code = self.request.session.pop('room_code')

        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            host_id = self.request.session.session_key
            room_results = Room.objects.filter(host=host_id)
            if len (room_results) > 0:
                room = room_results[0]
                room.delete()

        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)

class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request,  format=None):
        # Create session, if one does not exist yet
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid:
            code = serializer.data.get('code')
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')

            queryset = Room.onjects.filter(code=code)
            if not queryset.exists():
                return Response({'Not Present': 'Room code not found.'}, status=status.HTTP_404_NOT_FOUND)
            
            room = queryset[0]
            # check if user is modifying own room, based on session id
            user_id = self.request.session.session_key
            if room.host != user_id:
                return Response({'Permission Denied': 'Not authorized to modify the room.'}, status=status.HTTP_403_FORBIDDEN)

            # update room
            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)


        return Response({'Bad Request': 'Invalid data sent for room update.'}, status=status.HTTP_400_BAD_REQUEST)
