# Fynd AI Intern Assessment - Complete Project Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Task 1: Rating Prediction](#task-1-rating-prediction)
3. [Task 2: Two-Dashboard System](#task-2-two-dashboard-system)
4. [Technology Stack Recommendations](#technology-stack-recommendations)
5. [Timeline & Execution Plan](#timeline--execution-plan)
6. [Report Structure](#report-structure)
7. [Winning Strategies](#winning-strategies)

---

## 🎯 Project Overview

### Deliverables Required
1. **GitHub Repository** (mandatory)
   - Python notebook for Task 1
   - Application code for Task 2
   - Supporting files (schemas, prompts, configs)
   - Deployment links

2. **Short Report** (PDF)
   - Overall approach
   - Design and architecture decisions
   - Prompt iterations and improvements
   - Evaluation methodology and results
   - System behavior, trade-offs, limitations

3. **Deployed Dashboards** (mandatory)
   - User Dashboard (public URL)
   - Admin Dashboard (public URL)
   - Must be fully functional without local setup

### Key Success Factors
- ✅ Production-quality code (not prototype code)
- ✅ Thoughtful AI engineering decisions
- ✅ Beautiful, intuitive UX
- ✅ Comprehensive documentation
- ✅ Fast completion (viewed positively)

---

## 📊 TASK 1: Rating Prediction via Prompting

### Understanding the Task

**Goal:** Design prompts that classify Yelp reviews into 1-5 star ratings using only LLM prompts (no ML training).

**Input Example:**
```
Review: "The food was amazing! Best pizza I've ever had. Service was quick and friendly."
Actual Rating: 5 stars
```

**Your Output (JSON):**
```json
{
  "predicted_stars": 5,
  "explanation": "Highly positive language ('amazing', 'best ever'), excellent food and service, strong satisfaction indicators"
}
```

### The Workflow

```
Dataset (Yelp Reviews)
    ↓
Your Prompts (3 approaches)
    ↓
LLM Processing
    ↓
Predictions + Explanations
    ↓
Evaluation (Actual vs Predicted)
```

### Three Prompting Approaches (Required)

#### **Approach 1: Zero-Shot Direct**

**Purpose:** Baseline, simple instruction

```python
prompt_v1 = f"""
You are a star rating classifier for restaurant reviews.

Based on the review below, predict the star rating from 1 to 5.
- 1 star = Terrible experience
- 2 stars = Poor experience  
- 3 stars = Average/Okay experience
- 4 stars = Good experience
- 5 stars = Excellent experience

Review: {review_text}

Return ONLY valid JSON in this exact format:
{{
  "predicted_stars": <number between 1-5>,
  "explanation": "<brief 1-2 sentence reasoning>"
}}
"""
```

#### **Approach 2: Few-Shot with Examples**

**Purpose:** Teach the model through examples

```python
prompt_v2 = f"""
You are a star rating classifier. Learn from these examples:

Example 1:
Review: "Absolutely terrible! Worst food ever. Rude staff. Never coming back."
Rating: 1
Reason: Extremely negative language, multiple complaints, explicit rejection

Example 2:
Review: "Food was cold. Service was slow. Disappointed overall."
Rating: 2
Reason: Multiple negative points, expression of disappointment

Example 3:
Review: "It was okay. Nothing special but not bad either. Decent for the price."
Rating: 3
Reason: Neutral language, no strong emotions either way, "okay" and "decent"

Example 4:
Review: "Really good food! Nice atmosphere. Had a great time. Will come again."
Rating: 4
Reason: Multiple positive points, positive emotion, intent to return

Example 5:
Review: "AMAZING! Best meal of my life! Perfect service, incredible flavors!"
Rating: 5
Reason: Superlatives, extremely positive language, multiple exclamations

Now classify this review:
Review: {review_text}

Return ONLY valid JSON:
{{
  "predicted_stars": <number 1-5>,
  "explanation": "<brief reason>"
}}
"""
```

#### **Approach 3: Chain-of-Thought Reasoning**

**Purpose:** Best accuracy through structured analysis

```python
prompt_v3 = f"""
You are an expert review analyzer. Follow this systematic approach:

STEP 1 - Analyze Key Dimensions:
- Food Quality: positive/negative/neutral/not mentioned
- Service Quality: positive/negative/neutral/not mentioned  
- Ambiance: positive/negative/neutral/not mentioned
- Value for Money: positive/negative/neutral/not mentioned

STEP 2 - Identify Rating Signals:
★ 5 STARS: "amazing", "best", "perfect", "incredible", "loved", "excellent"
★ 4 STARS: "great", "really good", "enjoyed", "nice", minor issues only
★ 3 STARS: "okay", "decent", "average", "alright", mixed feelings
★ 2 STARS: "disappointed", "not good", "poor", significant issues
★ 1 STAR: "terrible", "worst", "awful", "horrible", "never again"

STEP 3 - Evaluate Overall Tone:
- Count positive vs negative words
- Check for sarcasm or irony
- Note intensity of emotions
- Consider if they'd return

STEP 4 - Make Final Prediction:
Synthesize all factors into a rating.

Review to analyze: {review_text}

Return ONLY valid JSON:
{{
  "predicted_stars": <number 1-5>,
  "explanation": "<explain your reasoning based on the analysis above>"
}}
"""
```

### Implementation Code Structure

```python
# 1. SETUP
import pandas as pd
import json
import google.generativeai as genai
from sklearn.metrics import accuracy_score, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# Configure API
genai.configure(api_key='YOUR_GEMINI_API_KEY')
model = genai.GenerativeModel('gemini-1.5-flash')

# 2. LOAD DATA
df = pd.read_csv('yelp_reviews.csv')

# Sample 200 rows with balanced distribution
df_sample = df.groupby('stars').sample(n=40, random_state=42)
print(f"Total samples: {len(df_sample)}")
print(df_sample['stars'].value_counts().sort_index())

# 3. PREDICTION FUNCTION
def predict_rating(review_text, prompt_template):
    """Get prediction from LLM"""
    try:
        prompt = prompt_template.format(review_text=review_text)
        response = model.generate_content(prompt)
        
        # Extract JSON from response
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if '```json' in response_text:
            response_text = response_text.split('```json')[1].split('```')[0]
        elif '```' in response_text:
            response_text = response_text.split('```')[1].split('```')[0]
        
        # Parse JSON
        parsed = json.loads(response_text.strip())
        
        return {
            'predicted_stars': parsed['predicted_stars'],
            'explanation': parsed['explanation'],
            'json_valid': True,
            'raw_response': response_text
        }
    
    except Exception as e:
        return {
            'predicted_stars': None,
            'explanation': str(e),
            'json_valid': False,
            'raw_response': response.text if 'response' in locals() else None
        }

# 4. EVALUATE APPROACH
def evaluate_approach(df_sample, prompt_template, approach_name):
    """Run evaluation for one approach"""
    print(f"\n{'='*60}")
    print(f"Evaluating: {approach_name}")
    print(f"{'='*60}\n")
    
    results = []
    
    for idx, row in df_sample.iterrows():
        actual_stars = row['stars']
        review_text = row['text']
        
        prediction = predict_rating(review_text, prompt_template)
        
        results.append({
            'actual_stars': actual_stars,
            'predicted_stars': prediction['predicted_stars'],
            'review_text': review_text[:100] + '...',  # Truncate for display
            'explanation': prediction['explanation'],
            'json_valid': prediction['json_valid'],
            'correct': actual_stars == prediction['predicted_stars']
        })
        
        # Progress indicator
        if (idx + 1) % 20 == 0:
            print(f"Processed {idx + 1}/{len(df_sample)} reviews...")
    
    results_df = pd.DataFrame(results)
    
    # Calculate metrics
    valid_predictions = results_df[results_df['json_valid'] == True]
    
    accuracy = valid_predictions['correct'].mean()
    json_valid_rate = results_df['json_valid'].mean()
    
    print(f"\n📊 Results for {approach_name}:")
    print(f"   Accuracy: {accuracy:.2%}")
    print(f"   JSON Valid Rate: {json_valid_rate:.2%}")
    print(f"   Total Samples: {len(results_df)}")
    
    # Per-rating accuracy
    print(f"\n   Per-Rating Accuracy:")
    for rating in sorted(valid_predictions['actual_stars'].unique()):
        rating_df = valid_predictions[valid_predictions['actual_stars'] == rating]
        rating_acc = rating_df['correct'].mean()
        print(f"   ★ {rating}: {rating_acc:.2%} ({len(rating_df)} samples)")
    
    return results_df, accuracy, json_valid_rate

# 5. RUN ALL APPROACHES
approach_1_results, acc_1, json_1 = evaluate_approach(
    df_sample, prompt_v1, "Approach 1: Zero-Shot"
)

approach_2_results, acc_2, json_2 = evaluate_approach(
    df_sample, prompt_v2, "Approach 2: Few-Shot"
)

approach_3_results, acc_3, json_3 = evaluate_approach(
    df_sample, prompt_v3, "Approach 3: Chain-of-Thought"
)

# 6. COMPARISON TABLE
comparison_df = pd.DataFrame({
    'Approach': ['Zero-Shot', 'Few-Shot', 'Chain-of-Thought'],
    'Accuracy': [acc_1, acc_2, acc_3],
    'JSON Valid Rate': [json_1, json_2, json_3]
})

print("\n" + "="*60)
print("FINAL COMPARISON")
print("="*60)
print(comparison_df.to_string(index=False))

# 7. CONFUSION MATRIX (for best approach)
best_results = approach_3_results[approach_3_results['json_valid'] == True]

cm = confusion_matrix(
    best_results['actual_stars'], 
    best_results['predicted_stars']
)

plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
plt.title('Confusion Matrix - Chain-of-Thought Approach')
plt.ylabel('Actual Rating')
plt.xlabel('Predicted Rating')
plt.savefig('confusion_matrix.png')
plt.show()

# 8. SHOW EXAMPLE OUTPUTS
print("\n" + "="*60)
print("SAMPLE PREDICTIONS (Chain-of-Thought)")
print("="*60)

for i in range(5):
    row = best_results.iloc[i]
    status = "✓" if row['correct'] else "✗"
    print(f"\nExample {i+1} {status}:")
    print(f"Review: {row['review_text']}")
    print(f"Actual: {row['actual_stars']} stars")
    print(f"Predicted: {row['predicted_stars']} stars")
    print(f"Explanation: {row['explanation']}")
```

### Evaluation Metrics to Track

1. **Accuracy** (overall and per-rating)
2. **JSON Validity Rate** (how often valid JSON is returned)
3. **Confusion Matrix** (which ratings get confused?)
4. **Consistency** (same review → same prediction?)
5. **Edge Case Handling** (short reviews, sarcasm, mixed sentiment)

### Deliverables for Task 1

**In Notebook:**
- [ ] Data loading and exploration
- [ ] All 3 prompt approaches clearly shown
- [ ] Evaluation code for each approach
- [ ] Comparison table
- [ ] Confusion matrix visualization
- [ ] 10-15 example predictions (good and bad)
- [ ] Discussion of findings

**In Report:**
- [ ] Prompt evolution story (why each change was made)
- [ ] Results comparison table
- [ ] Key insights and learnings
- [ ] Trade-offs analysis

---

## 🚀 TASK 2: Two-Dashboard AI Feedback System

### System Overview

**Two Web Applications:**
1. **User Dashboard** - Public-facing, users submit reviews
2. **Admin Dashboard** - Internal, view all submissions with AI insights

**Key Requirement:** Real web applications (NOT Streamlit/Gradio/notebooks)

### Architecture Diagram

```
┌─────────────────────┐
│   User Dashboard    │  (React/Next.js on Vercel)
│   - Submit reviews  │
│   - Get AI response │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    API Layer        │  (Next.js API Routes / FastAPI)
│    - POST /reviews  │
│    - GET /reviews   │
│    - GET /analytics │
└──────────┬──────────┘
           │
           ├─────────────────┐
           │                 │
           ▼                 ▼
┌──────────────────┐  ┌─────────────┐
│    Database      │  │ LLM Service │
│   (Supabase)     │  │ (Gemini API)│
└──────────────────┘  └─────────────┘
           ▲
           │
┌──────────┴──────────┐
│  Admin Dashboard    │  (React/Next.js on Vercel)
│  - View submissions │
│  - AI summaries     │
│  - Analytics        │
└─────────────────────┘
```

### Technology Stack Recommendation

#### **Option 1: Next.js Full Stack (Recommended for Speed)**

**Advantages:**
- Single deployment (frontend + backend)
- Built-in API routes
- Deploy to Vercel in minutes
- Easy database integration

**Tech Stack:**
- **Frontend:** React + Next.js 14+ (App Router)
- **Backend:** Next.js API Routes
- **Database:** Vercel Postgres / Supabase
- **Styling:** Tailwind CSS + shadcn/ui
- **LLM:** Gemini API (free tier)
- **Deployment:** Vercel

#### **Option 2: Separate Frontend/Backend (Shows More Skills)**

**Advantages:**
- Demonstrates backend expertise
- Aligns with job description (FastAPI mentioned)
- Better for complex logic

**Tech Stack:**
- **Frontend:** React + Vite
- **Backend:** FastAPI + Python
- **Database:** Supabase / PostgreSQL
- **Deployment:** 
  - Frontend: Vercel
  - Backend: Render / Railway

**I recommend Option 1 for this assessment** - faster, simpler deployment, still production-grade.

### Database Schema

```sql
-- reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  user_response TEXT,
  admin_summary TEXT,
  recommended_actions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
```

### API Schema (JSON)

#### POST /api/reviews

**Request:**
```json
{
  "rating": 4,
  "reviewText": "Great food but service was a bit slow"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userResponse": "Thank you for your feedback! We're thrilled you enjoyed the food. We apologize for the slower service and will work on improving our wait times.",
    "createdAt": "2026-01-06T10:30:00Z"
  }
}
```

#### GET /api/reviews

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "rating": 4,
      "reviewText": "Great food but service was slow",
      "userResponse": "Thank you for your feedback...",
      "adminSummary": "Positive food experience with service concern",
      "recommendedActions": [
        "Review staffing levels during peak hours",
        "Follow up with customer to thank them"
      ],
      "createdAt": "2026-01-06T10:30:00Z"
    }
  ],
  "count": 1
}
```

### User Dashboard - Features

#### Core Features (Must Have)
- ⭐ Star rating selector (1-5, interactive)
- 📝 Text area for review (with character count)
- 🚀 Submit button
- ⏳ Loading state during submission
- ✅ Success message with AI response
- ❌ Error handling with retry option

#### Standout Features (Go Above)
- 🎨 Beautiful, modern UI (shadcn/ui components)
- 💬 AI response streaming (word-by-word)
- 📊 Real-time sentiment indicator (optional)
- 🎉 Smooth success animation
- 📱 Fully responsive design
- ♿ Accessibility features (ARIA labels, keyboard nav)

#### UI Design Principles
```
┌─────────────────────────────────────────┐
│         Leave Your Review               │
├─────────────────────────────────────────┤
│                                         │
│  How was your experience?               │
│  ★ ★ ★ ★ ☆  (4 stars selected)        │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Tell us more... (optional)        │ │
│  │                                   │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│  250 characters remaining              │
│                                         │
│  [ Submit Review ]                      │
│                                         │
└─────────────────────────────────────────┘

After submission:

┌─────────────────────────────────────────┐
│  ✓ Thank you for your feedback!         │
├─────────────────────────────────────────┤
│                                         │
│  💬 Our Response:                       │
│  ┌───────────────────────────────────┐ │
│  │ Thank you for the 4-star review!  │ │
│  │ We're glad you enjoyed...         │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [ Submit Another Review ]              │
└─────────────────────────────────────────┘
```

### Admin Dashboard - Features

#### Core Features (Must Have)
- 📋 Live table of all submissions
- 🔄 Auto-refresh (every 10-30 seconds)
- 🔍 Search functionality
- 🎯 Filter by rating
- 📊 Basic stats (total reviews, avg rating)
- 👁️ Expandable rows for full details

#### Standout Features (Go Above)
- 📈 Analytics dashboard
  - Rating distribution chart (bar/donut)
  - Submissions over time (line chart)
  - Average rating trend
  - Top keywords mentioned
- 🎨 Color-coded priority
  - 🔴 1-2 stars (urgent)
  - 🟡 3 stars (moderate)
  - 🟢 4-5 stars (positive)
- 📥 Export to CSV
- 🔔 "New submission" indicator
- 📅 Date range picker

#### UI Design Principles
```
┌─────────────────────────────────────────────────────┐
│  Admin Dashboard                    🔄 Auto-refresh │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📊 Overview                                        │
│  ┌─────────┬─────────┬─────────┬──────────┐       │
│  │ Total   │ Avg     │ Today   │ Pending  │       │
│  │ 127     │ 4.2⭐  │ 15      │ 3        │       │
│  └─────────┴─────────┴─────────┴──────────┘       │
│                                                     │
│  📈 Rating Distribution                             │
│  [Bar chart showing distribution]                  │
│                                                     │
│  📋 Recent Submissions                              │
│  ┌─────┬────────┬─────────────┬────────────┐      │
│  │ ⭐  │ Date   │ Summary     │ Actions    │      │
│  ├─────┼────────┼─────────────┼────────────┤      │
│  │ 1   │ 2m ago │ Food issue  │ [View]     │  🔴  │
│  │ 5   │ 5m ago │ Loved it!   │ [View]     │  🟢  │
│  │ 3   │ 8m ago │ Average     │ [View]     │  🟡  │
│  └─────┴────────┴─────────────┴────────────┘      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### LLM Prompting Strategy for Task 2

#### 1. User Response Generation

```python
user_response_prompt = f"""
You are a friendly, professional customer service representative.

A customer left this review:
Rating: {rating} out of 5 stars
Review: {review_text}

Generate a brief, personalized response (2-3 sentences) that:
- Thanks them for their feedback
- Acknowledges specific points they mentioned
- Sounds genuine and warm
- If rating is low (1-2), shows empathy and commitment to improvement
- If rating is high (4-5), expresses appreciation
- If rating is average (3), thanks them and asks what could be better

Return only the response text, no additional formatting.
"""
```

#### 2. Admin Summary Generation

```python
admin_summary_prompt = f"""
You are an AI assistant helping business managers understand customer feedback.

Review Details:
Rating: {rating}/5 stars
Review: {review_text}

Provide a concise 1-sentence summary that captures:
- Main sentiment/emotion
- Key issues or highlights mentioned
- Overall tone

Example: "Positive experience with food quality concern about wait time"

Return only the summary, no additional text.
"""
```

#### 3. Recommended Actions Generation

```python
recommended_actions_prompt = f"""
You are a business operations advisor analyzing customer feedback.

Review Details:
Rating: {rating}/5 stars
Review: {review_text}

Suggest 2-3 specific, actionable next steps for the business. Format as JSON array.

Guidelines:
- For 1-2 star reviews: Immediate response, investigate issues, offer resolution
- For 3 star reviews: Identify improvement areas, follow up optional
- For 4-5 star reviews: Thank customer, leverage positive feedback, minor improvements if mentioned

Return ONLY valid JSON:
["action 1", "action 2", "action 3"]
"""
```

### Error Handling Requirements

```typescript
// Handle empty reviews
if (!reviewText.trim() && rating) {
  // Still process, just note it's rating-only
}

// Handle very long reviews
const MAX_LENGTH = 1000;
if (reviewText.length > MAX_LENGTH) {
  reviewText = reviewText.substring(0, MAX_LENGTH);
}

// Handle LLM failures
try {
  const response = await callLLM(prompt);
} catch (error) {
  // Fallback response
  userResponse = "Thank you for your feedback. We've received your review and will respond soon.";
  adminSummary = `${rating}-star review (AI processing failed)`;
  recommendedActions = ["Review manually", "Respond to customer"];
}

// Handle database failures
try {
  await saveToDatabase(data);
} catch (error) {
  // Log error, show user-friendly message
  return { success: false, error: "Unable to save review. Please try again." };
}
```

### Project Structure (Next.js Example)

```
fynd-feedback-system/
├── app/
│   ├── page.tsx                 # User Dashboard (home page)
│   ├── admin/
│   │   └── page.tsx             # Admin Dashboard
│   ├── api/
│   │   ├── reviews/
│   │   │   ├── route.ts         # POST & GET /api/reviews
│   │   │   └── [id]/route.ts   # GET /api/reviews/:id
│   │   └── analytics/
│   │       └── route.ts         # GET /api/analytics
│   └── layout.tsx
├── components/
│   ├── user/
│   │   ├── RatingSelector.tsx
│   │   ├── ReviewForm.tsx
│   │   └── SuccessMessage.tsx
│   ├── admin/
│   │   ├── ReviewsTable.tsx
│   │   ├── AnalyticsChart.tsx
│   │   └── FilterControls.tsx
│   └── ui/                      # shadcn components
├── lib/
│   ├── db.ts                    # Database client
│   ├── llm.ts                   # LLM utilities
│   ├── prompts.ts               # Prompt templates
│   └── utils.ts
├── types/
│   └── index.ts                 # TypeScript types
├── .env.local
├── package.json
└── README.md
```

---

## ⏱️ Timeline & Execution Plan

### Day 1: Foundation (4-5 hours)

**Morning (2-3 hours):**
- [ ] Setup GitHub repo with proper structure
- [ ] Task 1: Download Yelp dataset
- [ ] Task 1: Data exploration and sampling
- [ ] Task 1: Implement Approach 1 (Zero-Shot)
- [ ] Task 1: Initial evaluation

**Afternoon (2 hours):**
- [ ] Task 1: Implement Approach 2 (Few-Shot)
- [ ] Task 1: Implement Approach 3 (Chain-of-Thought)
- [ ] Task 1: Complete evaluation and comparison
- [ ] Task 1: Generate visualizations
- [ ] Start report section for Task 1

### Day 2: Backend & Core Features (6-8 hours)

**Morning (3-4 hours):**
- [ ] Setup Next.js project
- [ ] Configure database (Supabase)
- [ ] Create database schema
- [ ] Implement API routes (POST /api/reviews)
- [ ] LLM integration (all 3 prompts)
- [ ] Test API with Postman/curl

**Afternoon (3-4 hours):**
- [ ] Implement GET /api/reviews
- [ ] Implement GET /api/analytics
- [ ] Error handling and validation
- [ ] Test edge cases
- [ ] Begin User Dashboard UI

### Day 3: Dashboards (6-8 hours)

**Morning (3-4 hours):**
- [ ] Complete User Dashboard
  - Rating selector component
  - Review form with validation
  - Success/error states
  - Loading indicators
- [ ] Test user flow end-to-end

**Afternoon (3-4 hours):**
- [ ] Build Admin Dashboard
  - Reviews table with auto-refresh
  - Analytics section
  - Filter/search functionality
- [ ] Polish UI/UX for both dashboards
- [ ] Responsive design testing

### Day 4: Polish & Deploy (4-6 hours)

**Morning (2-3 hours):**
- [ ] Deploy to Vercel
- [ ] Test deployed version thoroughly
- [ ] Fix any deployment issues
- [ ] Test cross-browser compatibility

**Afternoon (2-3 hours):**
- [ ] Complete project report
- [ ] Record demo video (optional but recommended)
- [ ] Final code cleanup
- [ ] Update README with deployment links
- [ ] Final submission

---

## 📝 Report Structure

### Page 1: Executive Summary

```markdown
# Fynd AI Feedback System - Project Report

## Executive Summary

This report documents the design, implementation, and evaluation of two AI-powered systems:
1. A prompt-engineered rating prediction system achieving 79% accuracy
2. A production-grade two-dashboard feedback management platform

**Key Achievements:**
- Systematic prompt engineering with measurable improvements
- Full-stack web application with real-time updates
- Production-ready error handling and validation
- Clean, scalable architecture

**Technologies:** Next.js, React, Supabase, Gemini AI, Vercel
```

### Pages 2-4: Task 1 Deep Dive

```markdown
## Task 1: Rating Prediction via Prompting

### Approach Overview

I designed three distinct prompting strategies to classify Yelp reviews:

1. **Zero-Shot Direct** - Baseline approach
2. **Few-Shot Learning** - Example-guided classification  
3. **Chain-of-Thought** - Structured reasoning process

### Prompt Evolution

**Version 1.0: Initial Zero-Shot**
- Simple instruction with rating scale
- **Issue:** Struggled with 2 vs 3 star reviews (65% accuracy)
- **Learning:** Needed clearer rating criteria

**Version 1.1: Enhanced Criteria**
- Added explicit indicators for each rating
- **Improvement:** Better at edge cases (70% accuracy)
- **Issue:** Still inconsistent on neutral reviews

**Version 2.0: Few-Shot Examples**
- Included 5 examples (one per rating)
- **Improvement:** Much better calibration (73% accuracy)
- **Issue:** Longer prompts, higher token usage

**Version 3.0: Chain-of-Thought**
- Multi-step reasoning process
- Aspect-based analysis
- **Final Result:** 79% accuracy with better explanations

### Evaluation Results

| Approach           | Accuracy | JSON Valid | Avg Time |
|--------------------|----------|------------|----------|
| Zero-Shot          | 67%      | 98%        | 1.2s     |
| Few-Shot           | 73%      | 99%        | 1.5s     |
| Chain-of-Thought   | 79%      | 97%        | 2.1s     |

### Key Insights

**What Worked:**
- Structured reasoning improved accuracy significantly
- Examples helped with edge cases
- Explicit criteria reduced ambiguity

**Challenges:**
- Sarcastic reviews often misclassified
- Very short reviews lacked context
- 2-3 star boundary was most difficult

**Trade-offs:**
- Accuracy vs Speed: CoT was slowest but most accurate