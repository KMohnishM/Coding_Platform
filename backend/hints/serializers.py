from rest_framework import serializers
from .models import Problem, Attempt, Hint, HintDelivery

class ProblemSerializer(serializers.ModelSerializer):
    """
    Serializer for the Problem model (list view).
    """
    class Meta:
        model = Problem
        fields = ['id', 'problem_id', 'title', 'difficulty', 'created_at']

class ProblemDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for the Problem model (detail view).
    """
    tests = serializers.SerializerMethodField()
    starting_code = serializers.SerializerMethodField()
    topic = serializers.CharField(default='General')
    
    class Meta:
        model = Problem
        fields = ['id', 'problem_id', 'title', 'description', 'difficulty', 
                  'created_at', 'topic', 'tests', 'starting_code']
    
    def get_tests(self, obj):
        """
        Get test cases for the problem.
        In a real implementation, this would fetch tests from a database.
        For now, we'll return sample tests.
        """
        return [
            {
                'input': 'Example input 1',
                'expected': 'Example output 1',
                'explanation': 'Explanation for example 1'
            },
            {
                'input': 'Example input 2',
                'expected': 'Example output 2',
                'explanation': 'Explanation for example 2'
            }
        ]
    
    def get_starting_code(self, obj):
        """
        Get starting code template for the problem.
        In a real implementation, this would fetch language-specific code templates.
        For now, we'll return a sample JavaScript template.
        """
        return "function solution(input) {\n  // Your code here\n  \n  return result;\n}"

class AttemptSerializer(serializers.ModelSerializer):
    """
    Serializer for the Attempt model.
    """
    class Meta:
        model = Attempt
        fields = ['id', 'user_id', 'problem', 'code', 'status', 'created_at']

class HintSerializer(serializers.ModelSerializer):
    """
    Serializer for the Hint model.
    """
    class Meta:
        model = Hint
        fields = ['id', 'problem', 'content', 'level', 'hint_type', 'created_at']

class HintDeliverySerializer(serializers.ModelSerializer):
    """
    Serializer for the HintDelivery model.
    """
    hint = HintSerializer()
    
    class Meta:
        model = HintDelivery
        fields = ['id', 'hint', 'user_id', 'is_auto_triggered', 'created_at']