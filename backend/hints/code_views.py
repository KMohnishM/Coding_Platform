from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
import logging
import json
import random

from .models import Problem, Attempt
from .hint_chain import HintChain

logger = logging.getLogger(__name__)

class CodeViewSet(viewsets.ViewSet):
    """
    ViewSet for handling code execution and submission.
    """
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        logger.info("🚀 Initializing CodeViewSet...")
        self.hint_chain = HintChain()
        logger.info("✅ CodeViewSet initialized successfully")
    
    def _get_problem(self, problem_id):
        """Get problem by ID"""
        logger.info(f"🔍 Looking up problem with ID: {problem_id}")
        
        try:
            problem = Problem.objects.get(problem_id=problem_id)
            logger.info(f"✅ Found problem: {problem.title}")
            return problem
        except Problem.DoesNotExist:
            logger.error(f"❌ Problem with ID {problem_id} not found")
            return None
    
    def _create_attempt(self, user_id, problem, code, status='pending'):
        """Create an attempt record"""
        logger.info(f"📝 Creating attempt record for user {user_id} on problem {problem.id}")
        
        attempt = Attempt.objects.create(
            user_id=user_id,
            problem=problem,
            code=code,
            status=status
        )
        
        logger.info(f"✅ Created attempt record: {attempt.id}")
        return attempt
    
    def _execute_code(self, problem, code, language):
        """
        Execute code against test cases.
        In a real implementation, this would use a secure code execution service.
        For now, we'll simulate execution.
        """
        logger.info(f"🏃 Executing {language} code for problem {problem.id}")
        
        # Simulate execution delay
        import time
        import random
        time.sleep(random.uniform(0.5, 1.5))
        
        # Sample test cases
        test_cases = [
            {'input': 'Example input 1', 'expected': 'Example output 1'},
            {'input': 'Example input 2', 'expected': 'Example output 2'}
        ]
        
        # Simulate results based on code length
        results = []
        success = True
        errors = []
        
        for test in test_cases:
            # Randomly determine if test passes (70% chance)
            passed = random.random() > 0.3
            if not passed:
                success = False
            
            results.append({
                'input': test['input'],
                'expected': test['expected'],
                'output': test['expected'] if passed else 'Incorrect output',
                'passed': passed
            })
        
        # Random chance of runtime error
        if random.random() < 0.2:
            success = False
            errors.append({
                'message': 'Runtime error: null is not a function',
                'line': random.randint(1, 10)
            })
        
        return {
            'success': success,
            'results': results,
            'errors': errors
        }
    
    @action(detail=False, methods=['post'])
    def run(self, request):
        """Run code against test cases"""
        user_id = request.data.get('user_id')
        problem_id = request.data.get('problem_id')
        code = request.data.get('code')
        language = request.data.get('language', 'javascript')
        
        if not all([user_id, problem_id, code]):
            return Response(
                {'error': 'Missing required fields'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get problem
        problem = self._get_problem(problem_id)
        if not problem:
            return Response(
                {'error': f'Problem with ID {problem_id} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Execute code
        execution_result = self._execute_code(problem, code, language)
        
        # Create attempt
        attempt_status = 'success' if execution_result['success'] else 'failed'
        attempt = self._create_attempt(user_id, problem, code, attempt_status)
        
        return Response({
            'success': execution_result['success'],
            'results': execution_result['results'],
            'errors': execution_result['errors'],
            'attempt_id': attempt.id,
            'execution_time': f"{random.uniform(0.01, 0.5):.2f}s"  # Simulated execution time
        })
    
    @action(detail=False, methods=['post'])
    def submit(self, request):
        """Submit solution for a problem"""
        user_id = request.data.get('user_id')
        problem_id = request.data.get('problem_id')
        code = request.data.get('code')
        language = request.data.get('language', 'javascript')
        
        if not all([user_id, problem_id, code]):
            return Response(
                {'error': 'Missing required fields'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get problem
        problem = self._get_problem(problem_id)
        if not problem:
            return Response(
                {'error': f'Problem with ID {problem_id} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Execute code (for submissions, we use the same execution for now)
        execution_result = self._execute_code(problem, code, language)
        
        # Create attempt
        attempt_status = 'success' if execution_result['success'] else 'failed'
        attempt = self._create_attempt(user_id, problem, code, attempt_status)
        
        return Response({
            'success': execution_result['success'],
            'results': execution_result['results'],
            'errors': execution_result['errors'],
            'attempt_id': attempt.id,
            'execution_time': f"{random.uniform(0.01, 0.5):.2f}s",  # Simulated execution time
            'submission_id': f"sub_{random.randint(10000, 99999)}"  # Simulated submission ID
        })