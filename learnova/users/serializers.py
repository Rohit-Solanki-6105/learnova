from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name', required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'password', 'role', 'created_at', 'updated_at']
        extra_kwargs = {'password': {'write_only': True}}
        
    def create(self, validated_data):
        name = validated_data.pop('first_name', '')
        user = User(
            email=validated_data['email'],
            username=validated_data['email'],
            first_name=name,
            role=validated_data.get('role', 3)
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
