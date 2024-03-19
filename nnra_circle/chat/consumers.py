from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import ChatMessage, Thread
from accounts.models import Profile

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        me = self.scope['user']#getting the connected user
        self.user_group_name = f"user_group_{me.id}"

        #think of a group as an inbox for a user
        await self.channel_layer.group_add(#adding the user to their designated group, this indicates they are online
            self.user_group_name,
            self.channel_name
        )

        await self.channel_layer.group_add(
            'presence_channel',
            self.channel_name
        )
        presence_payload = {
            'action': 'presence',
            'status': 'online',
            'user_id': me.id,
            'username': me.username
        }
        await self.update_user_presence(True)
        await self.channel_layer.group_send(
            'presence_channel',
            {
                'type': 'chat.message',
                'text': presence_payload
            }
        )
        print('ws connected')
        await self.accept()

    async def disconnect(self, code):
        user = self.scope['user']#currently logged in user

        presence_payload = {
            'action': 'presence',
            'status': 'offline',
            'user_id': user.id,
            'username': user.username
        }
        await self.update_user_presence(False)
        await self.channel_layer.group_send(
            'presence_channel',
            {
                'type': 'chat.message',
                'text': presence_payload
            }
        )
        print('ws disconnected')
        return super().disconnect(code)

    async def receive(self, text_data=None, bytes_data=None):
        user = self.scope['user']
        rd = json.loads(text_data)
        action = rd.get('action')

        if action == 'edit_message' or action == 'delete_message':
            receiver = rd.get('receiver')
            await self.channel_layer.group_send(
                f'user_group_{receiver}',
                {
                    "type": 'chat.message',
                    'text': rd
                }
            )

        if action == 'chat_message':
            receiver = rd.get('receiver')
            message = rd.get('message_body')
            statusid = rd.get('statusid')
            createdmsg = await self.create_chat_message(receiver, message)
            my_response = {
                'message': message,
                'sender': user.id,
                'receiver': receiver,
                'timestamp': timezone.now().isoformat(),
                'id': createdmsg.id,
                'action': 're_message'#indicates you are receiving a message
            }

            await self.channel_layer.group_send(
                f'user_group_{receiver}', #THIS is the group name of the person supposed to get the message
                {
                    "type": 'chat.message',
                    'text': my_response,
                }
            )

            # notify the sender that message has been sent
            sent_res = {
                'action': 'msg_confirmation',
                'statusid': statusid,
                'id': createdmsg.id
            }
            await self.channel_layer.group_send(
                f'user_group_{user.id}',
                {
                    "type": 'msg.confirmation',
                    "text": sent_res
                }
            )

        if action == 'msg_seen':#Notify the sender that message is seen
            print('message seen')
            msg_id = rd.get('msg_id')
            sender_id = rd.get('sender_id')
            payload = {
                'msg_id': msg_id,
                'action': 'msg_seen'
            }
            await self.channel_layer.group_send(
                f'user_group_{sender_id}',
                {
                    "type": 'msg.seen',
                    "text": payload
                }
            )


    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['text']))
    
    async def msg_seen(self, event):
        await self.send(text_data=json.dumps(event['text']))
    
    #When a message is sent, we reply with this to notify sender that message is sent
    async def msg_confirmation(self, event):
        await self.send(text_data=json.dumps(event['text']))

    @database_sync_to_async
    def update_user_presence(self, is_online):
        user = self.scope['user']
        profile = Profile.objects.filter(user__id=user.id).first()

        if profile:
            profile.is_online = is_online
            profile.save()
            return True
        return False
    
    @database_sync_to_async
    def create_chat_message(self, receiver, msg):
        sender= self.scope['user']
        
        thread, created = Thread.threadm.get_or_new(sender, receiver)

        if thread:
            chat_message, message = ChatMessage.chatm.create_chat(sender, receiver, msg, thread )
            return chat_message

        print('Error: Invalid thread')
        return thread