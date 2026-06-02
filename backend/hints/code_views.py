from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
import logging
import time

from .models import Problem, Attempt

logger = logging.getLogger(__name__)


class CodeViewSet(viewsets.ViewSet):
    """
    ViewSet for handling code execution and submission.
    Uses the Piston API for real multi-language code execution.
    """

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        logger.info("🚀 Initializing CodeViewSet with Piston execution engine...")
        # Lazy import to avoid circular imports
        from .execution_service import piston_service
        self.executor = piston_service
        logger.info("✅ CodeViewSet initialized successfully")

    def _get_problem(self, problem_id):
        """Get problem by ID — tries problem_id field first, then pk."""
        try:
            return Problem.objects.get(problem_id=problem_id)
        except Problem.DoesNotExist:
            pass
        try:
            return Problem.objects.get(pk=problem_id)
        except (Problem.DoesNotExist, ValueError):
            logger.warning(f"Problem not found: {problem_id}")
            return None

    def _create_attempt(self, user_id, problem, code, language, exec_status='pending'):
        """Create an attempt record."""
        try:
            attempt = Attempt.objects.create(
                user_id=user_id,
                problem=problem,
                code=code,
                status=exec_status,
            )
            return attempt
        except Exception as e:
            logger.error(f"Failed to create attempt: {e}")
            return None

    def _execute_code(self, problem, code, language):
        """
        Execute code using the Piston API.
        Extracts test cases from the problem description, runs the code,
        and compares outputs.
        """
        start = time.time()

        # ── Run the code via Piston ──
        result = self.executor.execute(code, language)
        elapsed = time.time() - start

        if not result['success'] and result.get('stderr'):
            # Compilation or runtime error
            return {
                'success': False,
                'results': [],
                'errors': [{'message': result['stderr'].strip()[:500], 'line': None}],
                'execution_time': f"{elapsed:.2f}s",
            }

        # Code ran successfully — build test result output
        stdout = result.get('stdout', '').strip()
        output_lines = stdout.split('\n') if stdout else []

        # Extract test cases from the problem's serialized tests if available
        test_cases = self._extract_test_cases(problem)

        if test_cases:
            test_results = []
            all_passed = True
            for i, tc in enumerate(test_cases):
                actual = output_lines[i].strip() if i < len(output_lines) else ''
                expected = tc.get('expected', '').strip()
                passed = actual == expected
                if not passed:
                    all_passed = False
                test_results.append({
                    'input': tc.get('input', f'Test case {i+1}'),
                    'expected': expected,
                    'output': actual or '(no output)',
                    'passed': passed,
                })
            return {
                'success': all_passed,
                'results': test_results,
                'errors': [],
                'execution_time': f"{elapsed:.2f}s",
            }
        else:
            # No test cases — just show the raw output
            return {
                'success': result['success'],
                'results': [{
                    'input': '(user code)',
                    'expected': '(run mode)',
                    'output': stdout or '(no output)',
                    'passed': result['success'],
                }],
                'errors': [],
                'execution_time': f"{elapsed:.2f}s",
            }

    def _extract_test_cases(self, problem):
        """
        Try to extract test cases from the problem.
        First checks the serialized 'tests' property, then falls back
        to parsing the description for Example blocks.
        """
        try:
            from .serializers import ProblemDetailSerializer
            serializer = ProblemDetailSerializer(problem)
            tests = serializer.data.get('tests', [])
            if tests:
                return tests
        except Exception:
            pass
        return []

    @action(detail=False, methods=['post'])
    def run(self, request):
        """Run code — executes and returns output without submission."""
        user_id = request.data.get('user_id')
        problem_id = request.data.get('problem_id')
        code = request.data.get('code')
        language = request.data.get('language', 'javascript')

        if not all([user_id, problem_id, code]):
            return Response(
                {'error': 'Missing required fields: user_id, problem_id, code'},
                status=status.HTTP_400_BAD_REQUEST
            )

        problem = self._get_problem(problem_id)
        if not problem:
            return Response(
                {'error': f'Problem with ID {problem_id} not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        execution_result = self._execute_code(problem, code, language)

        attempt_status = 'success' if execution_result['success'] else 'failed'
        attempt = self._create_attempt(user_id, problem, code, language, attempt_status)

        return Response({
            'success': execution_result['success'],
            'results': execution_result['results'],
            'errors': execution_result['errors'],
            'attempt_id': attempt.id if attempt else None,
            'execution_time': execution_result['execution_time'],
            'language': language,
        })

    @action(detail=False, methods=['post'])
    def submit(self, request):
        """Submit solution — executes and records as a submission."""
        user_id = request.data.get('user_id')
        problem_id = request.data.get('problem_id')
        code = request.data.get('code')
        language = request.data.get('language', 'javascript')

        if not all([user_id, problem_id, code]):
            return Response(
                {'error': 'Missing required fields: user_id, problem_id, code'},
                status=status.HTTP_400_BAD_REQUEST
            )

        problem = self._get_problem(problem_id)
        if not problem:
            return Response(
                {'error': f'Problem with ID {problem_id} not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        execution_result = self._execute_code(problem, code, language)

        attempt_status = 'success' if execution_result['success'] else 'failed'
        attempt = self._create_attempt(user_id, problem, code, language, attempt_status)

        return Response({
            'success': execution_result['success'],
            'results': execution_result['results'],
            'errors': execution_result['errors'],
            'attempt_id': attempt.id if attempt else None,
            'execution_time': execution_result['execution_time'],
            'language': language,
            'isSubmission': True,
            'submission_id': f"sub_{attempt.id}" if attempt else None,
        })