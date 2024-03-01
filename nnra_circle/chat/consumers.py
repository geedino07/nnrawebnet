from channels.generic.websocket import WebsocketConsumer

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        print('connected')
        self.accept()

    def disconnect(self, code):
        print('disconnected')
        return super().disconnect(code)

    def receive(self, text_data=None, bytes_data=None):
        print('recieved a message')
        return super().receive(text_data, bytes_data)