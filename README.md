# 🚀 Personalized Contextual Hint Generation System

A Django + React coding platform with intelligent hint generation, powered by your `problems_full.jsonl` data file.

## ✨ Key Features

### JSONL Integration (NEW!)
- 📚 **500+ Coding Problems** loaded from JSONL
- 🎯 **Topic-Based Organization** with colorful badges
- 📊 **Dual View Modes**: List View & Topic View
- 🎨 **Interactive Topic Statistics** with problem counts
- 🔍 **Advanced Filtering** by topic, difficulty, and search

### Hint System
- 💡 **Intelligent hint generation** based on problem context and user code
- 🎯 **Real-time hint delivery**
- 📈 **User progress tracking**
- 🔢 **Tiered hint system** (progressive hints)
- 🤖 **Automatic hint triggering** when users are stuck
- ⭐ **Hint quality evaluation**

### Code Editor
- 🖥️ **Monaco Code Editor** for writing solutions
- ✅ **Test case validation**
- 🎨 **Syntax highlighting**

## 🚀 Quick Start

### 1. Load Problems from JSONL (NEW!)
```bash
cd backend
python load_jsonl_problems.py
```
This will load all 500+ problems from `problems_full.jsonl` into the database.

### 2. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

python manage.py migrate
python manage.py runserver
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Open Browser
Visit http://localhost:5173 and start solving problems!

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Detailed setup guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Complete implementation overview
- **[TOPIC_VIEW_ENHANCEMENTS.md](TOPIC_VIEW_ENHANCEMENTS.md)** - Topic feature documentation
- **[PLATFORM_STRUCTURE.md](PLATFORM_STRUCTURE.md)** - Architecture and data flow
- **[backend/JSONL_LOADER_README.md](backend/JSONL_LOADER_README.md)** - Loader script details

## 🎯 What's New - Topic-Based Organization

### Enhanced Topic Display
- ✅ **Topic Statistics**: See problem counts for each topic at a glance
- ✅ **Topic View**: Browse problems grouped by topic with counts
- ✅ **Color-Coded Badges**: Each topic has a unique, consistent color
- ✅ **Interactive Filtering**: Click topic badges to instantly filter problems
- ✅ **Fixed Difficulty Mapping**: Properly handles beginner→easy, intermediate→medium, advanced→hard

### JSONL Integration
- ✅ **Complete Loader Script**: Parses and loads all JSONL data
- ✅ **Rich Descriptions**: Includes story, constraints, examples, pseudocode
- ✅ **Hint System**: Progressive hints from JSONL hints array
- ✅ **Test Cases**: Examples converted to test cases

## 🎨 User Interface

### Topic Statistics Section
```
┌─────────────────────────────────────────┐
│ Topics Overview                         │
│ [Array (45)] [String (32)] [Tree (28)] │
│ [Graph (15)] [DP (20)] [Stack (18)]    │
└─────────────────────────────────────────┘
```

### List View
All problems in a single list with topic and difficulty badges.

### Topic View
Problems organized by topic with counts - perfect for focused practice!

## 🛠️ Tech Stack

- **Backend**: Django + Django REST Framework
- **Frontend**: React + Vite + TailwindCSS
- **Editor**: Monaco Code Editor
- **Database**: SQLite
- **Data Source**: JSONL file (`problems_full.jsonl`)
- **AI**: OpenRouter API for hint generation

## 📊 Data Flow

```
problems_full.jsonl → load_jsonl_problems.py → Django DB → REST API → React Frontend
```

## 🎓 Usage

1. **Browse Problems**: Use filters and search to find problems
2. **Select View**: Toggle between List View and Topic View
3. **Filter by Topic**: Click topic badges in statistics section
4. **Solve Problems**: Click any problem to open the code editor
5. **Get Hints**: Use progressive hints when stuck
6. **Submit Code**: Run and test your solutions

## 📈 Statistics

Based on your JSONL file:
- **500+** coding problems
- **Multiple topics**: Array, String, Tree, Graph, DP, Stack, Queue, etc.
- **3 difficulty levels**: Easy, Medium, Hard
- **1500+** hints (average 3 per problem)
- **Test cases** for validation

## 🔧 Environment Variables

Set up `.env` file in backend directory:
```bash
cp .env.example .env
# Edit .env with your OpenRouter API key (for hint generation)
```

## API Testing with Postman

### 1. Request a Hint

**Endpoint:** `POST http://127.0.0.1:8000/api/hints/request_hint/`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
    "user_id": 123,
    "problem_id": 1,
    "user_code": "def twoSum(nums, target):\n    # Your code here",
    "problem_data": {
        "title": "Two Sum",
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
    }
}
```

**Response:**
```json
{
    "hint": {
        "id": 1,
        "content": "Consider using a hash map to store the numbers you've seen...",
        "level": 1,
        "type": "conceptual"
    },
    "evaluation": {
        "safety_score": 0.95,
        "helpfulness_score": 0.85,
        "quality_score": 0.90,
        "progress_alignment_score": 0.88,
        "pedagogical_value_score": 0.92
    },
    "attempt_id": 1,
    "user_progress": {
        "attempts_count": 1,
        "failed_attempts_count": 0,
        "current_hint_level": 2,
        "is_stuck": false
    }
}
```

### 2. Check Auto-Trigger

**Endpoint:** `POST http://127.0.0.1:8000/api/hints/check_auto_trigger/`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
    "user_id": 123,
    "problem_id": 1,
    "user_code": "def twoSum(nums, target):\n    # Your code here"
}
```

**Response (if hint should be triggered):**
```json
{
    "should_trigger": true,
    "hint": {
        "id": 2,
        "content": "Try using a hash map to store the numbers...",
        "level": 2,
        "type": "approach"
    },
    "evaluation": {
        "safety_score": 0.95,
        "helpfulness_score": 0.85,
        "quality_score": 0.90,
        "progress_alignment_score": 0.88,
        "pedagogical_value_score": 0.92
    },
    "attempt_id": 2,
    "user_progress": {
        "attempts_count": 2,
        "failed_attempts_count": 1,
        "current_hint_level": 3,
        "is_stuck": true
    }
}
```

**Response (if hint should not be triggered):**
```json
{
    "should_trigger": false,
    "user_progress": {
        "attempts_count": 1,
        "failed_attempts_count": 0,
        "current_hint_level": 1,
        "is_stuck": false
    }
}
```

## Testing Workflow

1. **First Request:**
   - Send problem data with the first request
   - System will create a new problem record
   - Returns first hint and evaluation

2. **Subsequent Requests:**
   - Only need to send problem_id (no need for problem data)
   - System will use existing problem
   - Returns next hint in sequence

3. **Auto-Trigger:**
   - System automatically checks if user is stuck
   - Triggers hint if user has been inactive for 5 minutes and has 3+ failed attempts
   - Returns hint with evaluation if triggered

## Error Handling

- **400 Bad Request:** Missing required fields
- **404 Not Found:** Problem not found and no problem data provided

## Development

To modify the system:

1. **Add New Hint Types:**
   - Update `HINT_TYPES` in `hints/models.py`
   - Add corresponding prompt templates in `hints/prompts.py`

2. **Modify Hint Generation:**
   - Update prompt templates in `hints/prompts.py`
   - Adjust evaluation criteria in `hints/services.py`

3. **Change Auto-Trigger Logic:**
   - Modify `is_stuck()` method in `UserProgress` model
   - Update thresholds in `hints/views.py`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
