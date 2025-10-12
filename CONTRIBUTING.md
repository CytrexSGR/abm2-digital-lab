# Contributing to ABM² Digital Lab

Thank you for your interest in contributing to the ABM² Digital Lab project! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation Standards](#documentation-standards)
- [Issue Reporting](#issue-reporting)

---

## Code of Conduct

This project adheres to professional standards of conduct:

- **Respectful collaboration** - Treat all contributors with respect
- **Constructive feedback** - Focus on code, not people
- **Open communication** - Ask questions, share knowledge
- **Quality focus** - Maintain high standards for code and documentation

---

## Getting Started

### Prerequisites

- **Backend:** Python 3.8+, pip, virtualenv
- **Frontend:** Node.js 16+, npm 8+
- **Optional:** Docker, PM2, Nginx (for production deployments)
- **Git:** Version control and collaboration

### First-Time Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/infinimind-creations/abm2-digital-lab.git
   cd abm2-digital-lab
   ```

2. **Set up backend:**
   ```bash
   cd digital-lab/backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up frontend:**
   ```bash
   cd digital-lab/frontend
   npm install
   ```

4. **Configure environment:**
   ```bash
   # Backend
   cp digital-lab/backend/.env.example digital-lab/backend/.env
   # Edit .env with your configuration

   # Frontend
   cp digital-lab/frontend/.env.example digital-lab/frontend/.env.development
   # Edit .env.development with your API URL
   ```

5. **Run development servers:**
   ```bash
   # Backend (from digital-lab/backend)
   uvicorn main:app --reload --host 0.0.0.0 --port 8000

   # Frontend (from digital-lab/frontend)
   npm start
   ```

---

## Development Setup

### Backend Development

**Virtual Environment:**
Always work within a virtual environment to avoid dependency conflicts.

```bash
cd digital-lab/backend
source venv/bin/activate
```

**Installing Dependencies:**
```bash
pip install -r requirements.txt
```

**Running the Backend:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**API Documentation:**
Access interactive API docs at `http://localhost:8000/docs`

### Frontend Development

**Installing Dependencies:**
```bash
cd digital-lab/frontend
npm install
```

**Running the Frontend:**
```bash
npm start
```

**Environment Configuration:**
- `.env.development` - Local development (default: localhost:8000)
- `.env.production` - Production build (configure for your domain)

**Build for Production:**
```bash
npm run build
```

---

## Code Style Guidelines

### Python (Backend)

**Style Standard:**
- Follow [PEP 8](https://peps.python.org/pep-0008/)
- Use [Black](https://github.com/psf/black) for automatic formatting
- Use type hints for function signatures

**Example:**
```python
from typing import List, Optional
from pydantic import BaseModel

def calculate_score(
    metrics: List[float],
    weights: Optional[List[float]] = None
) -> float:
    """
    Calculate weighted score from metrics.

    Args:
        metrics: List of metric values
        weights: Optional weights for each metric (defaults to equal weighting)

    Returns:
        Weighted score as float
    """
    if weights is None:
        weights = [1.0] * len(metrics)

    return sum(m * w for m, w in zip(metrics, weights)) / sum(weights)
```

**Key Principles:**
- Type hints for all public functions
- Docstrings for all classes and public methods
- Clear variable names (avoid single-letter variables except loop counters)
- Maximum line length: 100 characters (Black default)

### TypeScript/JavaScript (Frontend)

**Style Standard:**
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use ESLint and Prettier for automatic formatting
- Prefer functional components with hooks over class components

**Example:**
```typescript
import React, { useState, useEffect } from 'react';
import { Agent } from '../types/agent';

interface AgentListProps {
  filters?: Record<string, any>;
  onSelect?: (agent: Agent) => void;
}

export const AgentList: React.FC<AgentListProps> = ({ filters, onSelect }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch agents with filters
    fetchAgents(filters).then(data => {
      setAgents(data);
      setLoading(false);
    });
  }, [filters]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="agent-list">
      {agents.map(agent => (
        <AgentCard
          key={agent.id}
          agent={agent}
          onClick={() => onSelect?.(agent)}
        />
      ))}
    </div>
  );
};
```

**Key Principles:**
- Strict TypeScript mode enabled
- Interfaces for all props and data structures
- Functional components with named exports
- Descriptive component and variable names
- JSX formatting with Prettier

### YAML Configuration

**Style Standard:**
- 2-space indentation
- Alphabetical ordering of keys (where logical)
- Comments for complex configurations

**Example:**
```yaml
# Biome Configuration
biomes:
  - id: urban
    name: "Urban"
    capacity: 1000
    regeneration_rate: 0.05
    productivity_factor: 1.2
    # High productivity, low regeneration

  - id: rural
    name: "Rural"
    capacity: 500
    regeneration_rate: 0.15
    productivity_factor: 0.8
    # Lower productivity, higher regeneration
```

---

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring (no feature change)
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks (dependencies, build, etc.)

### Examples

**Simple commit:**
```
feat(agents): add wealth redistribution mechanism

Implemented progressive taxation system that transfers wealth from
high-income agents to low-income agents based on configurable rates.
```

**Commit with breaking change:**
```
refactor(api)!: change experiment results endpoint structure

BREAKING CHANGE: The `/api/experiments/{id}/results` endpoint now returns
a nested structure with separate fields for each treatment instead of a
flat array. Update client code accordingly.

Migration: Replace `results.data` with `results.treatments[0].data`
```

**Bug fix commit:**
```
fix(simulation): prevent negative wealth values

Added validation in wealth update logic to ensure agent wealth cannot
drop below zero. This prevents cascade failures in economic calculations.

Fixes #123
```

### Commit Message Guidelines

- **Subject line:** 50 characters or less, imperative mood ("add" not "added")
- **Body:** Wrap at 72 characters, explain WHAT and WHY (not HOW)
- **Footer:** Reference issues, note breaking changes
- **Attribution:** Include co-authorship for AI-assisted commits:
  ```
  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

---

## Pull Request Process

### Before Submitting

1. **Update from main:**
   ```bash
   git checkout main
   git pull origin main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Run tests:**
   ```bash
   # Backend tests
   cd digital-lab/backend
   pytest

   # Frontend tests
   cd digital-lab/frontend
   npm test
   ```

3. **Check code style:**
   ```bash
   # Backend
   black digital-lab/backend/
   mypy digital-lab/backend/

   # Frontend
   cd digital-lab/frontend
   npm run lint
   ```

4. **Update documentation:**
   - Update README.md if adding new features
   - Update CHANGELOG.md with your changes
   - Add/update docstrings and comments

### PR Template

```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Changes Made
- Change 1 with file reference
- Change 2 with file reference

## Testing
- [ ] Tested locally (describe how)
- [ ] Added/updated unit tests
- [ ] All tests passing

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex logic
- [ ] Updated documentation
- [ ] No new warnings or errors
- [ ] Tested in development environment
```

### Review Process

1. **Automated checks** must pass (linting, tests)
2. **Code review** by at least one maintainer
3. **Discussion** of design decisions if needed
4. **Approval** before merging
5. **Merge** via squash or rebase (no merge commits)

---

## Testing Requirements

### Backend Testing

**Framework:** pytest

**Running Tests:**
```bash
cd digital-lab/backend
pytest                    # Run all tests
pytest tests/test_api.py  # Run specific test file
pytest -v                 # Verbose output
pytest --cov              # Coverage report
```

**Test Structure:**
```python
import pytest
from main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_health_endpoint():
    """Test that health endpoint returns 200 OK."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.fixture
def sample_agent():
    """Fixture providing a sample agent for tests."""
    return {
        "id": "agent_001",
        "wealth": 100.0,
        "milieu": "traditional"
    }

def test_agent_creation(sample_agent):
    """Test agent creation with valid data."""
    response = client.post("/api/agents", json=sample_agent)
    assert response.status_code == 201
    assert response.json()["id"] == sample_agent["id"]
```

**Coverage Requirements:**
- Aim for 80%+ coverage on new code
- All API endpoints should have tests
- Critical business logic must be tested

### Frontend Testing

**Framework:** Jest + React Testing Library

**Running Tests:**
```bash
cd digital-lab/frontend
npm test              # Run all tests
npm test -- --coverage # Coverage report
```

**Test Structure:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { AgentCard } from './AgentCard';

describe('AgentCard', () => {
  const mockAgent = {
    id: 'agent_001',
    wealth: 100.0,
    milieu: 'traditional'
  };

  it('renders agent information correctly', () => {
    render(<AgentCard agent={mockAgent} />);
    expect(screen.getByText('agent_001')).toBeInTheDocument();
    expect(screen.getByText('Wealth: $100.00')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<AgentCard agent={mockAgent} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledWith(mockAgent);
  });
});
```

---

## Documentation Standards

### Code Documentation

**Python Docstrings (Google Style):**
```python
def calculate_gini_coefficient(wealth_distribution: List[float]) -> float:
    """
    Calculate the Gini coefficient for wealth distribution.

    The Gini coefficient measures inequality in a distribution, ranging
    from 0 (perfect equality) to 1 (perfect inequality).

    Args:
        wealth_distribution: List of wealth values for all agents.

    Returns:
        Gini coefficient as a float between 0 and 1.

    Raises:
        ValueError: If wealth_distribution is empty or contains negative values.

    Example:
        >>> calculate_gini_coefficient([100, 100, 100])
        0.0  # Perfect equality
        >>> calculate_gini_coefficient([0, 0, 300])
        0.667  # High inequality
    """
```

**TypeScript JSDoc:**
```typescript
/**
 * Calculate the average value of a numeric array.
 *
 * @param values - Array of numbers to average
 * @returns The arithmetic mean of the values
 * @throws {Error} If array is empty
 *
 * @example
 * ```typescript
 * calculateAverage([1, 2, 3]); // Returns 2
 * ```
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) {
    throw new Error('Cannot calculate average of empty array');
  }
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}
```

### Markdown Documentation

**File Headers:**
All documentation files should start with metadata:

```markdown
# Document Title

**Status:** Active | Draft | Archived
**Last Updated:** YYYY-MM-DD
**Maintainer:** Name or Team

---

Brief description of document purpose.
```

**Structure:**
- Use hierarchical headings (# → ## → ###)
- Include table of contents for long documents
- Use code blocks with language hints
- Add links to related documentation

---

## Issue Reporting

### Bug Reports

When reporting bugs, include:

1. **Environment:**
   - OS and version
   - Python/Node.js version
   - Browser (for frontend issues)

2. **Steps to Reproduce:**
   - Detailed step-by-step instructions
   - Sample data or configuration

3. **Expected Behavior:**
   - What should happen

4. **Actual Behavior:**
   - What actually happens
   - Error messages or logs

5. **Screenshots/Logs:**
   - Visual evidence if applicable
   - Relevant log excerpts

### Feature Requests

When requesting features, include:

1. **Problem Statement:**
   - What problem does this solve?
   - Who benefits from this feature?

2. **Proposed Solution:**
   - How should it work?
   - UI mockups or API examples

3. **Alternatives Considered:**
   - Other approaches you've thought about

4. **Additional Context:**
   - Use cases, examples, references

---

## Questions?

If you have questions about contributing:

- **Documentation:** Check `/docs` directory
- **API Reference:** Visit `http://localhost:8000/docs` (when backend is running)
- **Issues:** Search existing issues or create a new one

---

**Thank you for contributing to ABM² Digital Lab!**

**Maintained by:** [Infinimind Creations](https://github.com/infinimind-creations)
**License:** MIT
