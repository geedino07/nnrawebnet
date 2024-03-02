from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import ChatMessage

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        me = self.scope['user']#getting the connected user
        self.user_group_name = f"user_group_{me.id}"

        #think of a group as an inbox for a user
        await self.channel_layer.group_add(#adding the user to their designated group, this indicates they are online
            self.user_group_name,
            self.channel_name
        )
      
        print('ws connected')
        await self.accept()

    async def disconnect(self, code):
        return super().disconnect(code)

    async def receive(self, text_data=None, bytes_data=None):
        user = self.scope['user']
        rd = json.loads(text_data)
        receiver = rd.get('receiver')
        action = rd.get('action')

        if action == 'chat_message':
            message = rd.get('message_body')
            my_response = {
                'message': message,
                'sender': user.id,
                'receiver': receiver,
                'timestamp': timezone.now().isoformat()
            }

            await self.create_chat_message(receiver, message)

            await self.channel_layer.group_send(
                f'user_group_{receiver}', #THIS is the group name
                {
                    "type": 'chat.message',
                    'text': my_response,
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['text']))

    @database_sync_to_async
    def create_chat_message(self, receiver, msg):
        sender= self.scope['user']
        chat_message, message = ChatMessage.chatm.create_chat(sender, receiver, msg )
        print(message)
        return chat_message